---
layout: post
title:  "Causality"
date:   2018-10-12 18:04:07 +0900
categories: jekyll update
comments: true
excerpt_separator: <!--more-->
---

<!--more-->

<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

Does height causes temperature?

It makes sense, that if we are at high altitudes the temperature will be lower.
But is the high altitude causing the low temperatures?

The concept of height and temperature are human made. Nobody _saw_ the physical objects of height or temperature. Things that are not existing can't cause other things are not existing.
But still it can make sense to argue, that an abstract idea causes another abtract idea.

Let's try to disect this problem.

Height and temperature are not existing, but we can _measure_ it. We can measure the altitude with an altimeter and the temperature with a thermometer.

We can formulate these measurement devices in form of probabilistic conditional distributions.
The altimeter tells you the height \\(h_t\\) for time t and is described by 

$$ p(h_t|w_t) $$

and the current temperature \\(T_t\\) is described by

$$ p(T_t|w_t), $$

where \\(w_t\\) represents all of the physical world at the current time. We also assumed, that the two measurement devices have to internal dynamics. We can directly infer height and temperature from one observation. In real life, this assumption does not hold. In order to measure temperature you need the timeaverage of particle movements. But this is not important for our example.

In this exmaple everything is static. There is no action taken.

But now let's think about taking actions in our environment.

If you take the action of changing the height, will this _cause_ a decrease in temperature?
No, it won't. There is no physical cause if we change the point of our measurement device. But it will change the measurement of temperature.

The other way around, if we lower the temperature, will this _cause_ an increase in height?
It could also be, that we are now measuring in siberia, and our altidude hadn't changed at all. Again, we only changed the position where the measurement was taken at. But haven't changed the physical world at all.


















