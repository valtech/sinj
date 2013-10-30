var scItem = function (id) {
	return function () {
		var database = $sc.db;

		return [database.GetItem(id)];
	};
};

var scSetField = function (name, value) {
	return function (item) {
		item.Editing.BeginEdit();

		var field = item.Fields.Item.get(name);

		field.SetValue(value, true);

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

			field.SetValue(values[name], true);
		}

		item.Editing.AcceptChanges();
	};
};

var scUpdateItem = function (update) {
	var items = update.forItems();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		$sc.log("Updating item '" + item.Name + "'");

		scSetFields(update.setFields)(item);
	}
};

var scUpdateItems = function (updates) {
	for (var i = 0; i < updates.length; i++) {
		var update = updates[i];

		scUpdateItem(update);
	}
};

var scInsertItem = function (update) {
	var parents = update.parents();

	for (var j = 0; j < items.length; j++) {
		var parent = parents[j];
	}
};
