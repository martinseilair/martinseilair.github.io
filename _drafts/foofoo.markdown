---
layout: post
title:  "Klur"
date:   2018-05-01 18:04:07 +0900
categories: jekyll update foo
---
sdgadf
dfh
sdfh
sfg
sfgh




{%- for post in site.categories.foo -%}



{{ post.title | escape }}

{% endfor %}

{{ page.url | escape }}