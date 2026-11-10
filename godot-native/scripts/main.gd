extends Node2D

const PURPLE := Color("#a855f7")
const PINK := Color("#ec4899")
const CYAN := Color("#38bdf8")
const DARK := Color("#080711")
const ROAD := Color("#171323")

var player_x := 0.0
var target_x := 0.0
var obstacles: Array[Rect2] = []
var road_marks: Array[float] = []
var speed := 440.0
var score := 0.0
var best := 0
var spawn_clock := 0.0
var road_offset := 0.0
var running := false
var paused := false
var game_over := false
var boost_energy := 100.0
var boost_active := false
var ui: CanvasLayer
var score_label: Label
var best_label: Label
var energy_label: Label
var overlay: ColorRect
var title_label: Label
var message_label: Label
var primary_button: Button
var buttons_box: VBoxContainer

func _ready() -> void:
	_load_best()
	player_x = get_viewport_rect().size.x * 0.5
	target_x = player_x
	_build_ui()
	_show_menu()
	get_viewport().size_changed.connect(_on_resize)

func _on_resize() -> void:
	if not running:
		player_x = get_viewport_rect().size.x * 0.5
		target_x = player_x
	queue_redraw()

func _build_ui() -> void:
	ui = CanvasLayer.new()
	add_child(ui)
	var hud := HBoxContainer.new()
	hud.position = Vector2(28, 22)
	hud.add_theme_constant_override("separation", 26)
	ui.add_child(hud)
	score_label = _label("SCORE  000000", 20)
	best_label = _label("BEST  000000", 15)
	energy_label = _label("BOOST  100%", 15)
	hud.add_child(score_label)
	hud.add_child(best_label)
	hud.add_child(energy_label)
	overlay = ColorRect.new()
	overlay.color = Color(0.025, 0.018, 0.05, 0.91)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(overlay)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)
	buttons_box = VBoxContainer.new()
	buttons_box.custom_minimum_size = Vector2(420, 0)
	buttons_box.add_theme_constant_override("separation", 14)
	center.add_child(buttons_box)
	title_label = _label("NEON DRIFT", 48)
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_color_override("font_color", Color("#d8b4fe"))
	buttons_box.add_child(title_label)
	message_label = _label("NIGHT RUN // ARCADE PROTOTYPE", 14)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	buttons_box.add_child(message_label)
	primary_button = _button("START RUN")
	primary_button.pressed.connect(_start_game)
	buttons_box.add_child(primary_button)
	var hint := _label("A / D or ← / →  STEER     SPACE  BOOST\nDODGE TRAFFIC. SURVIVE. BEAT YOUR BEST.", 13)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	buttons_box.add_child(hint)

func _label(text_value: String, size: int) -> Label:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", Color("#f5f3ff"))
	return label

func _button(text_value: String) -> Button:
	var button := Button.new()
	button.text = text_value
	button.custom_minimum_size = Vector2(0, 54)
	button.add_theme_font_size_override("font_size", 18)
	button.add_theme_color_override("font_color", Color.WHITE)
	button.add_theme_stylebox_override("normal", _button_style(Color("#6d28d9")))
	button.add_theme_stylebox_override("hover", _button_style(Color("#9333ea")))
	button.add_theme_stylebox_override("pressed", _button_style(Color("#581c87")))
	return button

func _button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 9
	style.corner_radius_top_right = 9
	style.corner_radius_bottom_left = 9
	style.corner_radius_bottom_right = 9
	style.content_margin_left = 18
	style.content_margin_right = 18
	return style

func _show_menu() -> void:
	overlay.visible = true
	title_label.text = "NEON DRIFT"
	message_label.text = "NIGHT RUN // WINDOWS EDITION"
	primary_button.text = "START RUN"
	_set_primary_action(_start_game)

func _start_game() -> void:
	running = true
	paused = false
	game_over = false
	score = 0
	speed = 440
	spawn_clock = 0
	boost_energy = 100
	obstacles.clear()
	player_x = get_viewport_rect().size.x * 0.5
	target_x = player_x
	overlay.visible = false
	_update_hud()
	queue_redraw()

func _process(delta: float) -> void:
	if not running or paused or game_over:
		return
	var size := get_viewport_rect().size
	var left := size.x * 0.28
	var right := size.x * 0.72
	var steer := Input.get_axis("ui_left", "ui_right")
	if steer != 0:
		target_x += steer * 620.0 * delta
	if Input.is_action_pressed("boost") and boost_energy > 0:
		boost_active = true
		boost_energy = maxf(0, boost_energy - 38.0 * delta)
	else:
		boost_active = false
		boost_energy = minf(100, boost_energy + 18.0 * delta)
	var actual_speed := speed * (1.55 if boost_active else 1.0)
	player_x = move_toward(player_x, clampf(target_x, left + 34, right - 34), 900.0 * delta)
	score += actual_speed * delta * 0.06
	speed = minf(850, speed + 5.0 * delta)
	road_offset = fmod(road_offset + actual_speed * delta, 100.0)
	spawn_clock -= delta
	if spawn_clock <= 0:
		_spawn_obstacle(size)
		spawn_clock = randf_range(0.58, 1.05) * (440.0 / speed)
	for i in range(obstacles.size() - 1, -1, -1):
		var obstacle := obstacles[i]
		obstacle.position.y += actual_speed * delta
		obstacles[i] = obstacle
		if obstacle.position.y > size.y + 100:
			obstacles.remove_at(i)
			continue
		var player_rect := Rect2(Vector2(player_x - 21, size.y - 132), Vector2(42, 68))
		if player_rect.intersects(obstacle):
			_end_game()
	_update_hud()
	queue_redraw()

func _spawn_obstacle(size: Vector2) -> void:
	var road_left := size.x * 0.28
	var road_width := size.x * 0.44
	var lane := randi_range(0, 2)
	var x := road_left + road_width * (float(lane) + 0.5) / 3.0
	obstacles.append(Rect2(Vector2(x - 22, -80), Vector2(44, 68)))

func _end_game() -> void:
	running = false
	game_over = true
	var final_score := int(score)
	if final_score > best:
		best = final_score
		_save_best()
	overlay.visible = true
	title_label.text = "RUN OVER"
	message_label.text = "SCORE  %06d     BEST  %06d" % [final_score, best]
	primary_button.text = "RUN AGAIN"
	queue_redraw()

func _update_hud() -> void:
	score_label.text = "SCORE  %06d" % int(score)
	best_label.text = "BEST  %06d" % best
	energy_label.text = "BOOST  %02d%%" % int(boost_energy)

func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE and running:
		paused = not paused
		overlay.visible = paused
		title_label.text = "PAUSED"
		message_label.text = "TAKE A BREATHER. YOUR RUN IS WAITING."
		primary_button.text = "RESUME"
		if paused:
			_set_primary_action(_resume_game)
		else:
			_set_primary_action(_start_game)

func _resume_game() -> void:
	paused = false
	overlay.visible = false
	_set_primary_action(_start_game)

func _set_primary_action(action: Callable) -> void:
	for connection in primary_button.pressed.get_connections():
		primary_button.pressed.disconnect(connection.callable)
	primary_button.pressed.connect(action)

func _draw() -> void:
	var size := get_viewport_rect().size
	draw_rect(Rect2(Vector2.ZERO, size), DARK)
	var road_left := size.x * 0.28
	var road_width := size.x * 0.44
	draw_rect(Rect2(Vector2(road_left, 0), Vector2(road_width, size.y)), ROAD)
	draw_line(Vector2(road_left, 0), Vector2(road_left, size.y), PURPLE, 3)
	draw_line(Vector2(road_left + road_width, 0), Vector2(road_left + road_width, size.y), PURPLE, 3)
	for lane in [1, 2]:
		var x := road_left + road_width * float(lane) / 3.0
		for y in range(-100, int(size.y) + 100, 100):
			var mark_y := fposmod(float(y) + road_offset, size.y + 100.0) - 50.0
			draw_rect(Rect2(Vector2(x - 2, mark_y), Vector2(4, 42)), Color(0.65, 0.55, 0.85, 0.6))
	for obstacle in obstacles:
		draw_rect(obstacle, Color("#f43f5e"), true, 7.0)
		draw_rect(Rect2(obstacle.position + Vector2(7, 9), Vector2(30, 12)), Color("#fecdd3"))
	_draw_car(Vector2(player_x, size.y - 98), boost_active)
	if boost_active:
		draw_circle(Vector2(player_x, size.y - 30), 8, Color(0.66, 0.33, 0.97, 0.6))

func _draw_car(center: Vector2, boosting: bool) -> void:
	var body := PackedVector2Array([
		center + Vector2(0, -38), center + Vector2(22, -18),
		center + Vector2(19, 31), center + Vector2(-19, 31),
		center + Vector2(-22, -18)
	])
	draw_colored_polygon(body, PURPLE)
	draw_polyline(PackedVector2Array([body[0], body[1], body[2], body[3], body[4], body[0]]), Color("#e9d5ff"), 2.0)
	draw_rect(Rect2(center + Vector2(-13, -13), Vector2(26, 14)), CYAN)
	draw_rect(Rect2(center + Vector2(-23, 18), Vector2(6, 14)), Color.BLACK)
	draw_rect(Rect2(center + Vector2(17, 18), Vector2(6, 14)), Color.BLACK)
	if boosting:
		draw_colored_polygon(PackedVector2Array([center + Vector2(-9, 30), center + Vector2(0, 55), center + Vector2(9, 30)]), PINK)

func _save_best() -> void:
	var file := FileAccess.open("user://neon_drift.save", FileAccess.WRITE)
	if file:
		file.store_32(best)

func _load_best() -> void:
	if FileAccess.file_exists("user://neon_drift.save"):
		var file := FileAccess.open("user://neon_drift.save", FileAccess.READ)
		if file:
			best = file.get_32()
