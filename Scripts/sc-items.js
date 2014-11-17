var scItem = function (id, language, version) {
    if (id) {
        var database = $sc.db;

        var item;

        $sc.log("id = " + id + ", lang = " + language + ", version = " + version);

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
    }

    return [];
};

var scEnsureItem = function (id, language, version) {
	var item = scItem(id, language, version);

	if (item != null) {
		if (item.Versions.Count < 1) {
			item = item.Versions.AddVersion();
		}
	}

	return item;
};

var scSwitchItem = function (item, language, version) {
	if (language != null) {
		//PERF: don't switch if current item is in requested language 

		item = scEnsureItem(item.ID, language, version);
	}
	else {
		if (item != null) {
			if (item.Versions.Count < 1) {
				item = item.Versions.AddVersion();
			}
		}
	}

	return item;
};

var scItemQuery = function (id) {
	return function (language, version) {
		return [scItem(id, language, version)];
	};
};

var scValue = function(value) {
	if (value === true) {
		value = "1";
	} else if (value === false) {
		value = "";
	} else if (Object.prototype.toString.call(value) === '[object Array]') {
		value = value.join("|");
	}

	return "" + value;
};

var scSetField = function (name, value) {
	return scSetFields({ name: name, value: value });
};

var scSetFields = function (values) {
	return function (item) {
		if (values == null) {
			return;
		}

		var fields = item.Fields;

		var updates = [];

		for (var name in values) {
			var field = fields.Item.get(name);

			var value = scValue(values[name]);

			if (field == null) {
				field = fields.Item.get("__" + name);

				if (field == null) {
					if (name == "Insert Options") {
						field = fields.Item.get("__Masters");
					}
				}
			}

			if (field != null) {
				if (value != field.Value) {
					updates.push({
						field: field,
						value: value
					});
				}
			}
			else {
				var msg = "Field '" + name + "' does not exist for item + '" + item.Paths.Path + "'.";
				$sc.log(msg);
				throw msg;
			}
		}

		if (updates.length > 0) {
			$sc.log("Fields changed on '" + item.Paths.Path + "'");

			item.Editing.BeginEdit();

			for (var i = 0; i < updates.length; i++) {
				var update = updates[i];

				update.field.SetValue(update.value, true);
			}

			item.Editing.EndEdit();
		}
	};
};

var scUpdateItem = function (packet) {
	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		item = scSwitchItem(item, packet.language);

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

var scInsertItem = function (packet) {
	if (packet.name == null) {
		throw "Name not specified for item to create.";
	}

	var parent = scItem(packet.parent, packet.language);

	var template = scTemplate(packet.template);

	if (template == null) {
		throw "Could not find template '" + packet.template + "'";
	}

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

	item = scSwitchItem(item);

	scSetFields(packet.fields)(item);
};

var scDeleteItem = function (packet) {
	var items = packet.item();

	for (var j = 0; j < items.length; j++) {
		var item = items[j];

		if (typeof(item.ID) != 'undefined') {
		    item = scSwitchItem(item, packet.language);

		    if (item != null) {
		        $sc.log("Deleting item '" + item.Paths.Path + "'");

		        item.Delete();
		    }
		} else {
		    $sc.log("Cannot delete item, it does not exist.");
		}
	}
};

var scDeleteItems = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scDeleteItem(packet);
	}
};

var scMoveItem = function (itemId, newParentId) {
    var itemToMove = scItem(itemId, null, null);
    var newParentItem = scItem(newParentId, null, null);

    if (itemToMove && newParentItem) {
        $sc.log("Moving '" + itemId + "' (" + itemToMove.Paths.FullPath + ") to " + newParentItem.Paths.FullPath);

        itemToMove.MoveTo(newParentItem);
    } else {
        $sc.log("Cannot move item, item or parent not found.");
    }
};

var scRunActionForChildrenOf = function (parent, action) {
    for (var i = 0; i < parent.Children.Count; i++) {
        var result = action(parent.Children.Item(i));

        if (result === false) {
            break;
        }
    }
};

var scOpenPropertiesAfterAdd = {
    Default: "",
    No: 0,
    Yes: 1
};

var scGetFieldValue = function (item, fieldName) {
	var fieldValue = item.Item.get(fieldName);

	return fieldValue;
};

var scCreateUpdateObject = function (item) {
	return {
		item: scItemQuery(item.ID.ToString()),
		language: item.Language.ToString(),
		fields: {}
	};
};