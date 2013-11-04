var scItem = function (id, language, version) {
	var database = $sc.db;

	var item;

	if (language == null) {
		item = database.GetItem(id);
	}
	else if (version == null) {
		item = database.GetItem(id, $scLanguage.Parse(language));
	}
	else {
		item = database.GetItem(id, $scLanguage.Parse(language), new $scVersion(version));
	}

	if (item == null) {
		return [];
	}

	return item;
};

var scItemQuery = function (id) {
	return function (language, version) {
		return [scItem(id, language, version)];
	};
};

var scValue = function (value) {
	if (value === true) {
		value = "1";
	}
	else if (value === false) {
		value = "";
	}

	return value;
}

var scSetField = function (name, value) {
	return scSetFields({name: name, value: value});
};

var scSetFields = function (values) {
	return function (item) {
		if (values == null) {
			return;
		}

		//PERF: if fields up to date, skip...
		var fields = item.Fields;

		var changed = false;

		for (var name in values) {
			var field = fields.Item.get(name);

			if (field != null) {
				if (scValue(values[name]) != field.Value) {
					changed = true;

					break;
				}
			}
		}

		if (changed) {
			$sc.log("Fields changed on '" + item.Paths.Path + "'");

			item.Editing.BeginEdit();

			for (var name in values) {
				var field = fields.Item.get(name);

				if (field != null) {
					var value = scValue(values[name]);

					if (scValue(values[name]) != field.Value) {
						field.SetValue(value, true);
					}
				}
			}

			item.Editing.EndEdit();
		}
	};
};

var scUpdateItem = function (packet) {
	//TODO: languages

	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		$sc.log("Updating item '" + item.Paths.Path + "'");

		scSetFields(packet.fields)(item);
	}
};

var scUpdateItems = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scUpdateItem(packet);
	}
};

var scInsertItems = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertItem(packet);
	}
};

//for languages need destination of parent to be language

var scInsertItem = function (packet) {
	//TODO: languages

	if (packet.name == null) {
		throw "Name not specified for item to create.";
	}

	var parent = scItem(packet.parent);

	var template = $sc.db.GetTemplate(packet.template);

	var item;

	$sc.log("Inserting item '" + packet.name + "' under parent '" + parent.Paths.Path + "'");

	//PERF: if item exists, skip...
	if (packet.id == null) {
		item = parent.Add(packet.name, template);
	}
	else {
		item = $scItemManager.AddFromTemplate(packet.name, template.ID, parent, new $scID(packet.id));
	}

	if (item.Name != packet.name) {
		item.Editing.BeginEdit();

		item.Name = packet.name;

		item.Editing.EndEdit();
	}

	scSetFields(packet.fields)(item);
};

var scDeleteItem = function (packet) {
	//TODO: languages

	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		if (item != null) {
			$sc.log("Deleting item '" + parent.Paths.Path + "'");

			item.Delete();
		}
	}
};

var scDeleteItems = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scDeleteItem(packet);
	}
};
