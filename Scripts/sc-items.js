var scItem = function (id) {
	return function () {
		var database = $sc.db;

		var item = database.GetItem(id);

		if (item == null) {
			return [];
		}

		return [item];
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
	return function (item) {
		item.Editing.BeginEdit();

		var field = item.Fields.Item.get(name);

		field.SetValue(scValue(value), true);

		item.Editing.AcceptChanges();
	};
};

var scSetFields = function (values) {
	return function (item) {
		if (values == null) {
			return;
		}

		item.Editing.BeginEdit();

		var fields = item.Fields;

		for (var name in values) {
			var field = fields.Item.get(name);

			var value = values[name];

			field.SetValue(scValue(values[name]), true);
		}

		item.Editing.AcceptChanges();
	};
};

var scUpdateItem = function (packet) {
	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		$sc.log("Updating item '" + item.Name + "'");

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

var scInsertItem = function (packet) {
	if (packet.name == null) {
		throw "Name not specified for item to create.";
	}

	var parents = packet.parent();

	for (var j = 0; j < parents.length; j++) {
		var parent = parents[j];

		var template = packet.template();

		var item;

		if (packet.id == null) {
			item = parent.Add(packet.name, template);
		}
		else {
			item = $scItemManager.AddFromTemplate(packet.name, template.ID, parent, new $scID(packet.id));

			if (item.Name != packet.name) {
				item.Editing.BeginEdit();

				item.Name = packet.name;

				item.Editing.AcceptChanges();
			}
		}

		scSetFields(packet.fields)(item);
	}
};

var scDeleteItem = function (packet) {
	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		if (item != null) {
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
