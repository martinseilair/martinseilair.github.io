function load_race_track(id, url){
	function race_track_radius(rad){
		function deviation(x){
			return 10.0*Math.cos(8*x) + 290*gaussian(x,Math.PI-0.4,0.5) - 30*gaussian(x,Math.PI-0.0,0.2) + 330*gaussian(x,Math.PI+0.3,0.4);
		}
		return r = this.base_radius + deviation(rad);
	}

	var strip_n = 1000;

	

	// define race track
	var w = 800;
	var h = 500;
	var base_radius = 180;
	var base_x = w - base_radius - 80;
	var base_y = 250;

	rt = new RadialRaceTrack(w, h, base_x, base_y, base_radius, race_track_radius);
	rt.id = id;
	rt.add_tree(base_x, base_y);
	rt.set_strip_domain(strip_n);

	// define race car
	rc = new RaceCar(rt,url);
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
	bf_x_map = race_track.strip_pos;
	state_n = race_track.strip_pos.length;
	output_n = race_track.strip_pos.length;
	bf_u_map = [0, 1, 2];
	max_dist = race_track.w;
	bf_y_map = [...Array(output_n)].map((e,i)=>{return max_dist*i/output_n;});


	// discretize pdf
	bf_initial_dist = norm_vector([...Array(state_n)].map((e,i)=>{return 1.0;}));
	bf_system_dist = bf_u_map.map((u)=>{
		return bf_x_map.map((x)=>{
			return norm_vector(race_car.system_dist_array(bf_x_map,x,u));
		});
	});

	bf_output_dist = bf_x_map.map((x)=>{
			return norm_vector(race_car.output_dist_array(bf_y_map,x,0));
	});

	function cont_2_disc_output(output){
		output = Math.abs(output);
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



function mouse_move(){

	if(scene.mode==3){
		var coords = d3.mouse(this);
		var min_dist = 50.0;
		var nearest = scene.rt.get_nearest_pos(coords);
		if(nearest.distance < min_dist){
			scene.rt.show_strip("inner");
			scene.rt.show_strip("outer");
			scene.rt.update_car(nearest.pos,dur, 0);
			scene.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, nearest.pos, 2));
			scene.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, nearest.pos));
		}else{
			scene.rt.hide_strip("inner");
			scene.rt.hide_strip("outer");
		}
	}


}

function key_down(){
	var key = d3.event.keyCode;

	current_input = -1;
	if(key==65) current_input = 0;
	if(key==83) current_input = 1;
	if(key==68) current_input = 2;

	if (current_input<0) return;

	if(scene.mode==1){
		for (var i=0;i<ani_step;i++){
			step();
		}
	}else if(scene.mode==2){
		step();
	}

}



function finished_loading(){

	// SITE LOADED!


		//plot_pdf("output_dist_approx", bf_output_dist);
		//plot_pdf("system_dist_approx", bf_system_dist[2]);

	for (var i=0;i<scenes.length;i++){

		scenes[i].rt.set_mouse_move(mouse_move)
		scenes[i].rt.set_key_down(key_down)
		// init track and car
		var svg = document.getElementById(scenes[i].rt.id);


		scenes[i].rt.draw_race_track(svg);

		scenes[i].rc.reset();


		// initialize strips

		outer_color = d3.interpolateRgb(d3.rgb(scenes[i].rt.svg.style("background-color")), d3.rgb('#00028e'))
		inner_color = d3.interpolateOranges;

		if(scenes[i].use_particle_filter){
			// particle
			scenes[i].pf.init_samples();	
			scenes[i].rt.init_strip("outer", get_system_dist_normalized(scenes[i].rc, scenes[i].rt, scenes[i].rc.state, current_input), outer_color, 60);
			scenes[i].rt.init_strip("inner", get_output_dist_normalized(scenes[i].rc, scenes[i].rt, scenes[i].rc.state), inner_color, 60);
		}else{
			// bayes

			scenes[i].rt.init_strip("outer", normalize_vector(scenes[i].bf.posterior), outer_color, 60);
			scenes[i].rt.init_strip("inner", get_output_dist_normalized(scenes[i].rc, scenes[i].rt, scenes[i].rc.state), inner_color, 60);	
		}
	}

}



// animation


function step(){

if (aa % ani_step == 0){
		//input=2;

	    scene.rc.step(current_input);

	    if(scene.use_particle_filter){
	    	scene.pf.predict(current_input);
			scene.rt.update_strip("outer", get_system_dist_normalized(scene.rc, scene.rt, scene.rc.state, current_input));
			scene.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, scene.rc.state));
		}else{
			//bayes
			scene.bf.predict(current_input);
			scene.rt.hide_strip("inner");
			scene.rt.update_strip("outer", normalize_vector(scene.bf.posterior));
		}



	}else if (aa % ani_step == 1){
		output = rc.output_dist_sample(0);
		if(scene.use_particle_filter){
	    	scene.pf.update(output, 0);
		}else{
			//bayes
			scene.rt.show_strip("inner");
			scene.rt.update_strip("inner", get_output_dist_normalized(scene.rc, scene.rt, rc.state));

		}
	}else{
		if(scene.use_particle_filter){
	    	scene.pf.ancestor_sampling();
	    }else{
			//bayes
	    	y = scene.bf.cont_2_disc_output(output);
			scene.bf.update(y);

			scene.rt.update_strip("outer", normalize_vector(scene.bf.posterior));
	    }
	}

	aa++;

}


function ani(){

	if(interval){

		interval = null;
		return;
	}

	if(interval==null&&scene.mode==0){

		interval = setInterval(step, dur);
	}

}