	// add loaded listener
	window.addEventListener("load", function(event) {
		loaded=true;
		finished_loading();
	});

	window.addEventListener("scroll", function(event) {
		var svg;

		//var window_center = window.scrollY + window.innerHeight/2.0;
		var window_center = window.innerHeight/2.0;
		var min_dist;
		var min_id;
		var old_scene = scene;

		if(scenes.length>0){
			for (var i=0;i<scenes.length;i++){
				svg = document.getElementById(scenes[i].rt.id);
				var rect = svg.getBoundingClientRect();
				var svg_center = rect.top + rect.height/2.0;

				dist = Math.abs(svg_center - window_center);
				if (i==0 || min_dist>dist){
					min_dist = dist;
					min_id = i;
				}
			}
			scene = scenes[min_id];
			if(loaded){
				if (scene!=old_scene){
					if(interval){
						clearInterval(interval);
						interval = null;
					}
					if(scene.auto_start){
						ani(scene);
					}
				}
			}



		}


	});



	window.addEventListener('touchstart', function(e)
	{
		var id = get_parent_scene(e.target);
		if(id>=0){
			if(scenes[id].mode==3){
				touch_id = id;	
			}
		}
	});

	window.addEventListener('touchend', function()
	{
	    touch_id = null;
	});

	window.addEventListener('touchmove', function(e)
	{

	    if (touch_id!=null)
	    {
	    	var el = document.getElementById(scenes[touch_id].rt.id);
	    	var svg_viewbox = el.viewBox.baseVal;
	    	var svg_rect = el.getBoundingClientRect();
			var x = (event.touches[0].clientX - svg_rect.left)*svg_viewbox.width/svg_rect.width;
			var y = (event.touches[0].clientY - svg_rect.top)*svg_viewbox.height/svg_rect.height;
	    	mouse_touch(touch_id, [x, y]);
	    }
	});












function load_race_track(id, url){
	function race_track_radius(rad){
		function deviation(x){
			return 10.0*Math.cos(8*x) + 290*gaussian(x,Math.PI-0.4,0.5) - 22*gaussian(x,Math.PI-0.0,0.2) + 330*gaussian(x,Math.PI+0.3,0.4);
		}
		return r = this.base_radius + deviation(rad);
	}

	var strip_n = 1000;
	var strip_dist_n = 1000;

	

	// define race track
	var w = 800;
	var h = 500;
	var base_radius = 180;
	var base_x = w - base_radius - 80;
	var base_y = 250;

	var rt = new RadialRaceTrack(w, h, base_x, base_y, base_radius, race_track_radius);
	rt.id = id;
	rt.add_tree(base_x, base_y);
	rt.set_strip_domain(strip_n);
	rt.set_dist_strip_domain(strip_dist_n);

	// define race car
	var rc = new RaceCar(rt,url);
	return {rc:rc, rt:rt};
}



function init_particle_filter(race_car, race_track){
	function observe_dist(distance, state){
		return race_car.output_dist_single(distance, state, 0);
	}
	var N = 100; //no. of particles
	pf = new ParticleFilter(N, race_car.system_dist_single.bind(race_car), race_car.system_dist_sample.bind(race_car), [observe_dist], race_car.initial_dist_sample.bind(race_car), race_track.draw_points.bind(race_track));
	return pf;
}



function init_bayes_filter(race_car, race_track){
	// define domains
	var bf_x_map = race_track.strip_pos;
	var state_n = race_track.strip_pos.length;
	var output_n = race_track.strip_pos.length;
	var bf_u_map = [0, 1, 2];
	var max_dist = race_track.w;
	var bf_y_map = [...Array(output_n)].map((e,i)=>{return max_dist*i/output_n;});


	// discretize pdf
	var bf_initial_dist = norm_vector([...Array(state_n)].map((e,i)=>{return 1.0;}));
	var bf_system_dist = bf_u_map.map((u)=>{
		return bf_x_map.map((x)=>{
			return norm_vector(race_car.system_dist_array(bf_x_map,x,u));
		});
	});

	var bf_output_dist = bf_x_map.map((x)=>{
			return norm_vector(race_car.output_dist_array(bf_y_map,x,0));
	});

	function cont_2_disc_output(output){
		var output = Math.abs(output);
		return Math.floor(output_n*output/max_dist);
	}
	return new DiscreteBayesFilter(bf_system_dist, bf_output_dist, bf_initial_dist, cont_2_disc_output);

}



function get_system_dist_normalized(race_car, race_track, pos, input) {
	var dist = race_car.system_dist_array(race_track.strip_pos, pos, input);
	dist = dist.map((e)=>{return Math.pow(e,0.1);})
	return normalize_vector(dist);
}

function get_output_dist_normalized(race_car, race_track, pos){
	var L = race_track.race_track_pos_abs(race_track.get_rad(pos), 0.0);
	distance = distance_xy(L, race_track.trees[0]);
	var out_dist = race_track.strip_pos.map((e)=>{return race_car.output_dist_single(distance, e, 0);})
	return normalize_vector(out_dist);
}

function mouse_touch(id, coords){



			if(scenes[id].mouse_touch){
				scenes[id].mouse_touch(coords);
				return
			}





			var min_dist = 100.0;
			var nearest = scenes[id].rt.get_nearest_pos(coords);
			if(nearest.distance < min_dist){
				
				
				scenes[id].rt.update_car(nearest.pos,scenes[id].dur, 0);
				if(scenes[id].me_show_system){
					scenes[id].rt.update_strip("outer", get_system_dist_normalized(scenes[id].rc, scenes[id].rt, nearest.pos, scenes[id].rc.current_input));
					scenes[id].rt.show_strip("outer");
				}
				if(scenes[id].me_show_observation_transposed){
					scenes[id].rt.update_strip("inner", get_output_dist_normalized(scenes[id].rc, scenes[id].rt, nearest.pos));
					scenes[id].rt.show_strip("inner");
				}

				if(scenes[id].me_show_observation){
					scenes[id].rt.update_dist_strip(normalize_vector(scenes[id].rc.output_dist_array(scenes[id].rt.dist_strip_domain, nearest.pos, 0)), nearest.pos, 0);
					scenes[id].rt.show_dist_strip();
				}
			}else{
				scenes[id].rt.hide_strip("inner");
				scenes[id].rt.hide_strip("outer");
				scenes[id].rt.hide_dist_strip();
			}

}

function mouse_move(){
	//if(this.id==scene.rt.id){

	var id = svg_in_scenes(this.id);

	if(id>=0){
		if(scenes[id].mode==3){
			var coords = d3.mouse(this);
			mouse_touch(id, coords);
			//mouse_touch(id, coords);
		}

	}


}


function key_to_input(key){
	var input = -1;
	if(key==65) input = 0;
	if(key==83) input = 1;
	if(key==68) input = 2;

	return input;

}

function key_down(){
	var key = d3.event.keyCode;

	var input = -1;
	if(key==65) input = 0;
	if(key==83) input = 1;
	if(key==68) input = 2;

	if (input<0) return;

	if(scene.key_down){
		scene.key_down(key);
		return;
	}



	scene.rc.current_input = input;
	if(scene.mode==1){
		for (var i=0;i<ani_step;i++){
			scene.step();
		}
	}else if(scene.mode==2){
		scene.step();
	}

}



function finished_loading(){

	// SITE LOADED!

	scene = scenes[0];
	//plot_pdf("output_dist_approx", bf_output_dist);
	//plot_pdf("system_dist_approx", bf_system_dist[2]);
	d3.select("body").on("keydown", key_down);
	


	for (var i=0;i<scenes.length;i++){

		scenes[i].rc.current_input = 2;



		if(scenes[i].filter=="particle"){
			scenes[i].pf = init_particle_filter(scenes[i].rc, scenes[i].rt)
		}else if(scenes[i].filter=="bayes"){
			scenes[i].bf = init_bayes_filter(scenes[i].rc, scenes[i].rt);
		}





		scenes[i].rt.set_mouse_move(mouse_move)

		// init track and car
		var svg = document.getElementById(scenes[i].rt.id);


		scenes[i].rt.draw_race_track(svg);


		if (scenes[i].mode == 3){
			scenes[i].rt.svg.style("touch-action","none")	
		}

		scenes[i].rc.init();


		if(scenes[i].me_show_observation){
			var dist_strip_color =  d3.interpolateRgb(d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#006d12'))
			scenes[i].rt.init_dist_strip(scenes[i].rc.state, normalize_vector(scenes[i].rc.output_dist_array(scenes[i].rt.dist_strip_domain, scenes[i].rc.state, 0)), dist_strip_color, 20, 0)
		}
		// initialize strips

		//var outer_color = d3.interpolateRgb(d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#00028e'))
		var outer_color = d3.piecewise(d3.interpolateRgb, [d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#006eff'), d3.rgb('#00028e')]);
		//var inner_color = d3.interpolateOranges;
		//var inner_color = d3.interpolateCubehelix(d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#8e3323'))
		var inner_color = d3.piecewise(d3.interpolateRgb, [d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#ff834d'), d3.rgb('#8e3323')]);


		if(scenes[i].filter=="particle"){
			scenes[i].pf.init_samples();
		}

		if(scenes[i].me_show_observation_transposed||scenes[i].filter=="particle"||scenes[i].filter=="bayes"){
			scenes[i].rt.init_strip("inner", get_output_dist_normalized(scenes[i].rc, scenes[i].rt, scenes[i].rc.state), inner_color, 60);
		}

		if(scenes[i].me_show_system){
			scenes[i].rt.init_strip("outer", get_system_dist_normalized(scenes[i].rc, scenes[i].rt, scenes[i].rc.state, scenes[i].rc.current_input), outer_color, 60);
		}


	

		if(scenes[i].filter=="bayes"){
			// bayes
			scenes[i].rt.init_strip("outer", normalize_vector(scenes[i].bf.posterior), outer_color, 60);
		}

		if(scenes[i].loaded){
			scenes[i].loaded();
		}



	}

	if(scene){
		if(scene.auto_start){
			ani(scene);
		}
	}



}



// animation

/*
function step(){

	

if (aa % ani_step == 0){
		//input=2;

	    scene.rc.step(scene.rc.current_input);

	    if(scene.filter=="particle"){
	    	scene.pf.predict(scene.rc.current_input);
			scene.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, scene.rc.state, scene.rc.current_input));
			scene.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state));
		}else if(scene.filter=="bayes"){
			//bayes
			scene.bf.predict(scene.rc.current_input);
			scene.rt.hide_strip("inner");
			scene.rt.update_strip("outer", normalize_vector(scene.bf.posterior));

		}

		if(scene.step){
			scene.step(0);
		}




	}else if (aa % ani_step == 1){

		if(scene.filter=="particle"){
			var output = scene.rc.output_dist_sample(0);
	    	scene.pf.update(output, 0);
		}else if(scene.filter=="bayes"){
			//bayes
			scene.rt.show_strip("inner");
			scene.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state));

		}
		if(scene.step){
			scene.step(1);
		}
	}else{
		if(scene.filter=="particle"){
	    	scene.pf.ancestor_sampling();
	    }else if(scene.filter=="bayes"){
			//bayes
			var output = scene.rc.output_dist_sample(0);
	    	y = scene.bf.cont_2_disc_output(output);
			scene.bf.update(y);


			scene.rt.update_strip("outer", normalize_vector(scene.bf.posterior));
	    }
	    if(scene.step){
			scene.step(2);
		}
	}

	aa++;


}
*/


function on_click(){

	if(scene.on_click){
		scene.on_click();
		return;
	}

	ani(scene);

}


function ani(sc){

	if(interval){
		clearInterval(interval);
		interval = null;
		return;
	}
	if(interval==null&&sc.mode==0){

		interval = setInterval(sc.step, sc.dur);
	}

}




function svg_in_scenes(id){

	if(scenes.length>0){
		for (var i=0;i<scenes.length;i++){
			if(id == scenes[i].rt.id) return i;
		}
	}

	return -1;
}


function get_parent_scene(element){
	if(scenes.length>0){
		for (var i=0;i<scenes.length;i++){
			if(isDescendantOrSelf(document.getElementById(scenes[i].rt.id), element)){
				return i;
			}
		}
	}
	return -1;
}