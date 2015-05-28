var scTemplate = function (id) {
    var template = $sc.db.GetTemplate(id);

    if (template == null) {
        var item = $sc.db.GetItem(id);

        if (item != null) {
            template = $sc.db.GetTemplate(item.ID);
        }
    }

    return template;
};

var scInsertTemplates = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertTemplate(packet);
	}
};

var scInsertTemplate = function (packet) {
	if (packet.name == null) {
		throw "Name not specified for template to create.";
	}

	var parent = $sc.db.GetItem(packet.parent);

	if (parent == null) {
		throw "Template '" + packet.parent + "'' not found.";
	}

	var parentBranch = $sc.db.Branches["__Template"];

	var item;

	if (packet.id != null) {
		item = $sc.db.GetTemplate(packet.id);
	}

	$sc.log("Inserting template '" + packet.name + "' under parent '" + parent.Paths.Path + "'");

	if (item == null) {
		//PERF: if template exists, skip...
		if (parentBranch == null) {
			var parentTemplate = $sc.db.Templates.Item.get($scTemplateIDs.Template);

			if (packet.id == null) {
				item = parent.Add(packet.name, parentTemplate);
			}
			else {
				item = $scItemManager.AddFromTemplate(packet.name, parentTemplate.ID, parent, new $scID(packet.id));
			}
		}
		else {
			if (packet.id == null) {
				item = parent.Add(packet.name, parentBranch);
			}
			else {
				item = $scItemManager.AddFromTemplate(packet.name, parentBranch.ID, parent, new $scID(packet.id));
			}
		}
	}

	if (item.Name != packet.name) {
		item.Editing.BeginEdit();

		item.Name = packet.name;

		item.Editing.EndEdit();
	}

	var id = item.ID.Guid.ToString();

	if (packet.fields) {
	    item = $sc.db.GetItem(item.ID);

	    scSetFields(packet.fields)(item);
	}

	if (packet.sections) {
		for (var j = 0; j < packet.sections.length; j++) {
			packet.sections[j].template = id;
		}

		scInsertTemplateSections(packet.sections);
	}

	var standardValues = packet.standardValues;

	if (standardValues) {
		if (Object.prototype.toString.call(standardValues) === '[object Array]') {
			for (var i = 0; i < standardValues.length; i++) {
				standardValues[i].template = id;

				scInsertStandardValues(standardValues[i]);
			}
		}
		else {
			standardValues.template = id;

			scInsertStandardValues(standardValues);
		}
	}
};

var scUpdateTemplate = function (packet) {
	if (packet.name == null) {
		throw "Name not specified for template to create.";
	}

	var parents = packet.parent();
}

var scInsertTemplateSections = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertTemplateSection(packet);
	}
};

var scInsertTemplateSection = function (packet) {
	var template = $sc.db.GetTemplate(packet.template);

	var item;

	if (packet.id == null) {
		item = template.AddSection(packet.name);
	}
	else {
		var parentTemplate = $sc.db.Templates.Item.get($scTemplateIDs.TemplateSection);

		item = $scItemManager.AddFromTemplate(packet.name, parentTemplate.ID, template.InnerItem, new $scID(packet.id));
	}

	if (item.Name != packet.name) {
		item.Editing.BeginEdit();

		item.Name = packet.name;

		item.Editing.EndEdit();
	}

	if (scSetFields && packet.sectionFields) {
	    scSetFields(packet.sectionFields)(item);
	}

	for (var j = 0; j < packet.fields.length; j++) {
		packet.fields[j].template = packet.template;
		packet.fields[j].section = item.ID.Guid.ToString();
	}

	scInsertTemplateFields(packet.fields);
};

var scInsertTemplateFields = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertTemplateField(packet);
	}
};

var scInsertTemplateField = function (packet) {
	var template = $sc.db.GetTemplate(packet.template);

	var section = template.GetSection(new $scID(packet.section));

	var item;

	if (packet.id == null) {
		item = section.AddField(packet.name);
	}
	else {
		var parentTemplate = $sc.db.Templates.Item.get($scTemplateIDs.TemplateField);

		item = $scItemManager.AddFromTemplate(packet.name, parentTemplate.ID, section.InnerItem, new $scID(packet.id));
	}

	if (item.Name != packet.name) {
		item.Editing.BeginEdit();

		item.Name = packet.name;

		item.Editing.EndEdit();
	}

	var properties = {};

	for (var name in packet) {
		if (name == 'id') {
			continue;
		}
		else if (name == 'template') {
			continue;
		}
		else if (name == 'section') {
			continue;
		}
		else if (name == 'name') {
			continue;
		}

		properties[name] = packet[name];
	}

	scSetFields(properties)(item);
};

var scInsertStandardValues = function (packet) {
	var languages = packet.languages;

	if (languages != null) {
		for (var i = 0; i < languages.length; i++) {
			scInsertStandardValuesForLanguage(packet, languages[i]);
		}
	}
	else {
		scInsertStandardValuesForLanguage(packet, packet.language);
	}
};

var scInsertStandardValuesForLanguage = function (packet, language) {
	$sc.log("standard values in language = " + language);

	var template = $sc.db.GetTemplate(packet.template);

	var standardValues = template.StandardValues;

	if (standardValues != null) {
	    var expectedId = new $scID(packet.id);

	    if (standardValues.ID.Guid.ToString() != expectedId.Guid.ToString()) {
			throw "Standard values did not have expected ID, stopping"
	    }
	}

	if (standardValues == null) {
        if (packet.id == null) {
            throw "Id not specified for standard values for template.";
	    } else {
	        var standardValues = $scItemManager.AddFromTemplate("__Standard Values", template.ID, template.InnerItem, new $scID(packet.id));

	        template.InnerItem.Editing.BeginEdit();
	        var standardValuesField = template.InnerItem.Fields.Item.get($scFieldIDs.StandardValues);
	        standardValuesField.SetValue(packet.id, true);
	        template.InnerItem.Editing.EndEdit();
	    }
	}

	if (language != null) {
		var localizedStandardValues = scItem(standardValues.ID.Guid.ToString(), language);

		if (localizedStandardValues.Versions.Count < 1) {
			localizedStandardValues.Versions.AddVersion();
		}

		standardValues = localizedStandardValues;
	}

	scSetFields(packet.fields)(standardValues);
};

var scMakeFieldsShared = function (template) {
	for (var s = 0; s < template.sections.length; s++) {
		var section = template.sections[s];
		for (var f = 0; f < section.fields.length; f++) {
			var field = section.fields[f];
			scMakeFieldShared(template.id, field);
		}
	}

	// Also ensure the checkboxes on the fields are ticked.
	scInsertTemplate(template);
};

var scMakeFieldShared = function(templateId, field) {
	var fieldId = field.id;

	$sc.log("scMakeFieldsShared on template:" + templateId + " field:" + fieldId);

	var templateField = $scTemplateManager.GetTemplateField(new $scID(fieldId), new $scID(templateId), $sc.db);

	if (templateField.IsShared) {
		$sc.log("scMakeFieldsShared skipping because this field is already shared.");
		return;
	}

	var result = $scTemplateManager.ChangeFieldSharing(templateField, $scTemplateFieldSharing.Shared, $sc.db);


	$sc.log("scMakeFieldShared result:" + result);
}

var scChangeTemplate = function (itemId, newTemplateId) {
    var template = $sc.db.GetTemplate(newTemplateId);
    var item = $sc.db.GetItem(itemId);

    if (item != null && template != null && item.Template.ID != template.ID) {
        $sc.log("Changing template of '" + item.Paths.Path + "' to '" + template.InnerItem.Paths.Path + "'");

        item.ChangeTemplate(template);
    }
};

var scFieldTypes = {
	"Checkbox": "Checkbox",
	"Date": "Date",
	"Datetime": "Datetime",
	"File": "File",
	"Image": "Image",
	"Integer": "Integer",
	"TextArea": "Multi-Line Text",
	"Number": "Number",
	"Password": "Password",
	"HTML": "Rich Text",
	"Text": "Single-Line Text",
	"Word": "Word Document",
	"Checklist": "Checklist",
	"Droplist": "Droplist",
	"GroupedDroplist": "Grouped Droplist",
	"GroupedDroplink": "Grouped Droplink",
	"Multilist": "Multilist",
	"MultilistWithSearch": "Multilist with Search",
	"Treelist": "Treelist",
	"Droplink": "Droplink",
	"Droptree": "Droptree",
	"Tristate": "Tristate",
	"NameValueList": "Name Value List",
	"GeneralLink": "General Link",
    "SmartTreeList": "Smart Treelist"
};

var scFieldValidation = {
    Required: "{59D4EE10-627C-4FD3-A964-61A88B092CBC}"
}

var scAllLanguages = [];

for (var j = 0; j < $sc.db.Languages.Length; j++) {
    scAllLanguages[j] = $sc.db.Languages[j].Name;
}
