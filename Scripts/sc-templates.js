var scTemplate = function (id) {
    var template = $sc.db.GetTemplate(id);

    if (template == null) {
        var item = $sc.db.GetItem(id);

        if (item != null) {
            template = $sc.db.GetTemplate(item.ID);
        }
    }

    return template;
}

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

    if (packet.sections) {
        for (var j = 0; j < packet.sections.length; j++) {
            packet.sections[j].template = id;
        }

        scInsertTemplateSections(packet.sections);
    }

    if (packet.standardValues) {
        packet.standardValues.template = id;

        scInsertStandardValues(packet.standardValues);
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

	//PERF: if section exists, skip...
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

	//PERF: if field exists, skip...
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
	var template = $sc.db.GetTemplate(packet.template);

	var standardValues = template.StandardValues;

	if (standardValues == null) {
		standardValues = template.CreateStandardValues();
	}

	if (packet.language != null) {
		//PERF: if language requested is same as standardValues, skip...
		var localizedStandardValues = scItemQuery(standardValues.ID.Guid.ToString())(packet.language);
	
		if (localizedStandardValues.Versions.Count < 1) {
			localizedStandardValues.Versions.AddVersion();
		}

		standardValues = localizedStandardValues;
	}

	scSetFields(packet.fields)(standardValues);
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
	"Treelist": "Treelist",
	"Droplink": "Droplink",
	"Droptree": "Droptree",
	"Tristate": "Tristate"
};
