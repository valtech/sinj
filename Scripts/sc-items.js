var scItem = function (id, language, version) {
    if (id) {
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
		item = scEnsureItem(item.ID, language, version);
	} else {
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
			    var rawValue = values[name];
			    var value = null;

			    if (rawValue && typeof (rawValue) === "function") {
			        value = rawValue(field.Value, item);
			        value = scValue(value);
			    } else {
			        value = scValue(rawValue);
			    }

			    if (value != field.Value) {
					updates.push({
						field: field,
						value: value
					});
				}
			}
			else {
				var msg = item.Paths.Path + " - Field '" + name + "' does not exist";

				throw new Error(msg);
			}
		}

		if (updates.length > 0) {
			item.Editing.BeginEdit();

			for (var i = 0; i < updates.length; i++) {
				var update = updates[i];

				if (update.field.Name == "__Masters" && update.value == 'null') {
					$sc.log(item.Paths.Path + " - Resetting Insert Options");

				    update.field.Reset();
				} else {
					$sc.log(item.Paths.Path + " - Updating field '" + update.field.Name + "' in " + item.Language.ToString());

			        update.field.SetValue(update.value, true);
			    }
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
		throw new Error("Name not specified for item to create.");
	}

	var parent = scItem(packet.parent, packet.language);

	if (!scIsValidItem(parent)) {
		throw new Error("Could not find parent '" + packet.parent + "'");
	}

	var template = scTemplate(packet.template);

	if (!scIsValidItem(template)) {
		throw new Error("Could not find template '" + packet.template + "'");
	}

	var item;

	if (packet.id == null) {
		$sc.log(parent.Paths.Path + "/" + packet.name + " - Creating item");

		item = parent.Add(packet.name, template);
	} else {
		if (!scItemExists(packet.id)) {
			$sc.log(parent.Paths.Path + "/" + packet.name + " - Creating item");
		}

		item = $scItemManager.AddFromTemplate(packet.name, template.ID, parent, new $scID(packet.id));
	}

	if (item.Name != packet.name) {
		$sc.log(item.Paths.Path + " - Renaming item to '" + packet.name + "'");

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
		    	$sc.log(item.Paths.Path + " - Deleting item");

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

var scMoveItem = function (itemId, newParentPath) {
    var item = $sc.db.GetItem(itemId);
    var newParent = $sc.db.GetItem(newParentPath);

    if (item != null && newParent != null && item.Parent.ID != newParent.ID) {
    	$sc.log(item.Paths.Path + " - Moving item to '" + newParent.Paths.Path + "/" + item.Name + "'");

        item.MoveTo(newParent);
    }
};

var scFieldValueEnsureInList = function () {
    var itemIds = arguments;

    return function (existingValue, item) {
        var newValue = existingValue;

        for (var i = 0; i < itemIds.length; i++) {
            var itemId = itemIds[i];
            var foundIndex = newValue.toLowerCase().indexOf(itemId.toLowerCase());

            if (foundIndex == -1) {
                if (newValue) {
                    newValue = newValue + "|" + itemId;
                } else {
                    newValue = itemId;
                }
            }
        }

        return newValue;
    };
};

var scDeleteItemById = function (itemId) {
    if (scItemExists(itemId)) {
    	var item = $sc.db.GetItem(itemId);

    	$sc.log(item.Paths.Path + " - Deleting item");

    	item.Delete();
    } else {
    	$sc.log("Cannot delete item, it does not exist.");
    }
};

function scUpdateSingleField(id, language, fieldName, value) {
    var updatePackage =
    {
        item: scItemQuery(id),
        language: language,
        fields: {}
    };

    updatePackage.fields[fieldName] = value;

    scUpdateItem(updatePackage);
};

function scSetSortOrder(fieldId, sortOrder) {
    var update =
    {
        item: scItemQuery(fieldId),
        language: "en",
        fields: {
            "Sortorder": sortOrder
        }
    };

    scUpdateItem(update);
};

function scItemExists(id) {
	var item = $sc.db.GetItem(id);

	return scIsValidItem(item);
}

function scIsValidItem(item) {
	if (item) {
		if (typeof (item.ID) != 'undefined') {
			return true;
		}
	}

	return false;
}

function scRenameItem(itemId, newItemName) {
	if (scItemExists(itemId)) {
    	var item = $sc.db.GetItem(itemId);
		
		item.Editing.BeginEdit();
		item.Name = newItemName;
		item.Editing.AcceptChanges(false, false);
		item.Editing.EndEdit();
    } else {
    	$sc.log("Cannot rename item, it does not exist.");
    }
}