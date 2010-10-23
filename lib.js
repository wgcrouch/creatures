function Color(r, g, b, a)
{
	var color = {
		r : r,
		g : g,
		b : b,
		a : a
	};

	//Get an RGB string
	color.toString = function() {
		var color_string = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
		return color_string;
	};

	//Get a lighter/darker version of the color by a percentage
	color.getShade = function(percent) {
		var ratio = (100 + percent)/100;

		var r = Math.round(this.r * ratio);
		if (r > 255) {
			r = 255;
		}

		var g = Math.round(this.g * ratio);
		if (g > 255) {
			g = 255;
		}

		var b = Math.round(this.b * ratio);
		if (b > 255) {
			b = 255;
		}


		var lighter = new Color(r, g, b, this.a);

		return lighter;
	}

	color.getLighter = function(percent) {
		return this.getShade(percent);
	};

	color.getDarker = function(percent) {
		return this.getShade(-percent);
	};

	return color;
}

function Point2D(x, y)
{
	var point = {};
	point.x = x;
	point.y = y;
	return point;
}

function Food()
{
	var food = {};
	food.position = new Point2D();

	food.position.x =  Math.round(Math.random() * 400 + 1);
	food.position.y =  Math.round(Math.random() * 400 + 1);

	return food;
}
function Vector(x, y)
{
	var vector = {};
	
	vector.dir_x = x;
	vector.dir_y = y;
	
	return vector;
}

function Creature()
{
	var creature = {};
	creature.speed = Math.round(Math.random() * 3 + 1);
	creature.position = new Point2D();
	creature.turns_left = 4;
	creature.energy = Math.round(Math.random() * 5 + 1);

	var r = Math.round(Math.random() * 255);
	var g = Math.round(Math.random() * 255);
	var b = Math.round(Math.random() * 255);
	var a = 1//Math.round(Math.random()* 100) / 100;

	creature.color = new Color(r, g, b, a);

	creature.position.x =  Math.round(Math.random() * 400 + 1);
	creature.position.y =  Math.round(Math.random() * 400 + 1);

	creature.randomVector = function()
	{
		var dir_x = Math.round(((Math.random() * 2 + 1) -2) *  this.energy);
		var dir_y = Math.round(((Math.random() * 2 + 1) -2) *  this.energy);
		this.vector = new Vector(dir_x, dir_y)

	};

	creature.randomVector();

	creature.update = function(world)
	{
		this.position.x += this.vector.dir_x;
		this.position.y += this.vector.dir_y;
	
		this.turns_left -= 1;

		if (this.position.x >= 400 || this.position.x <= 0) {
			this.vector.dir_x = -this.vector.dir_x;
			this.turns_left += 1;
		}

		if (this.position.y >= 400 || this.position.y <= 0) {
			this.vector.dir_y = -this.vector.dir_y;
			this.turns_left += 1;
		}

		
		if (world.food.length) {

			var closest_food = 0;
			var distance_x = world.food[closest_food].position.x - this.position.x;
			var distance_y = world.food[closest_food].position.y - this.position.y;
			var distance_to_food = Math.sqrt(Math.pow(distance_x,2) + Math.pow((distance_y),2));

			var test_dist_x = 0;
			var test_dist_y = 0;
			var test_dist = 0;
			var i = 0;
			if (world.food.length > 1) {
				for (i == 1; i < world.food.length; i ++) {
					test_dist_x = world.food[i].position.x - this.position.x;
					test_dist_y = world.food[i].position.y - this.position.y;
					test_dist = Math.sqrt(Math.pow(test_dist_x,2) + Math.pow((test_dist_y),2));

					if (test_dist < distance_to_food) {
						distance_to_food = test_dist;
						distance_x = test_dist_x;
						distance_y = test_dist_y;
						closest_food = i;
					}
				}
			}

			if (Math.round(distance_to_food) <= this.energy ) {
				world.food.splice(closest_food, 1);
				this.energy += 0.1;
			} else {
				var steps = distance_to_food / this.energy;
				if (steps <= 20) {
					var dir_x = distance_x / steps;
					var dir_y = distance_y / steps;
					var vector_to_food = new Vector(dir_x, dir_y);
					this.vector = vector_to_food;
					this.turns_left = steps;
				}
			}
		}

		if (this.turns_left <= 0) {
			this.turns_left = Math.round(Math.random() * 10 + 1);
			this.randomVector();
		}


	};

	return creature;
}


function World(options)
{
	var world = {};

	var settings = jQuery.extend({
		context : null,
		number_of_creatures : 10,
		food_size : 5,
		creature_size : 3,
		food_color: new Color(0, 255, 0, 1),
		creature_color: new Color(0, 0, 0, 1)
	},
	options);

	var context = settings.context;

	world.addCreature = function(creature) {
		this.creatures.push(creature);
		return this;
	};

	world.addFood = function(food) {
		this.food.push(food);
		return this;
	};

	var i = 0;

	world.creatures = [];
	for (i = 0; i < settings.number_of_creatures; i++) {
		world.addCreature(new Creature());
	}

	world.food = [];


	world.draw = function() {
		var current_food;
		var current_creature;
		
		for (i = 0; i < this.food.length; i++) {
			current_food = this.food[i];
			context.strokeStyle = settings.food_color.toString();
			context.strokeRect(current_food.position.x, current_food.position.y, settings.food_size, settings.food_size);
		}

		for (i = 0; i < this.creatures.length; i++) {
			current_creature = this.creatures[i];
			context.fillStyle = current_creature.color.toString();
			context.fillRect(current_creature.position.x, current_creature.position.y, current_creature.energy, current_creature.energy);
		}
	};

	world.update = function()
	{
		context.clearRect(0,0,400,400);

		world.draw();

		for (i = 0; i < this.creatures.length; i++) {
			this.creatures[i].update(this);
		}
	};

	return world;
}
