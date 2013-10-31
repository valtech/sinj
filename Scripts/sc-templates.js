var scTemplate = function (id) {
	return function () {
		var database = $sc.db;

		return database.GetTemplate(id);
	};
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

	var parents = packet.parent();

	for (var j = 0; j < parents.length; j++) {
		var parent = parents[j];

		var parentBranch = $sc.db.Branches["__Template"];

		var item;

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

				if (item.Name != packet.name) {
					item.Editing.BeginEdit();

					item.Name = packet.name;

					item.Editing.AcceptChanges();
				}
			}
		}

		var id =item.ID.Guid.ToString();

		for (var j = 0; j < packet.sections.length; j++) {
			packet.sections[j].templateId = id;
		}

		scInsertTemplateSections(packet.sections);


		for (var j = 0; j < packet.standardValues.length; j++) {
			packet.standardValues[j].templateId = id;
		}

		scInsertStandardValues(packet.standardValues);
	}
};

var scInsertTemplateSections = function (packets) {
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertTemplateSection(packet);
	}
};

var scInsertTemplateSection = function (packet) {
	var template = $sc.db.GetTemplate(packet.templateId);

	$sc.log("Adding template section:" + template.FullName);

	var item;

	if (packet.id == null) {
		item = template.AddSection(packet.name);
	}
	else {
		var parentTemplate = $sc.db.Templates.Item.get($scTemplateIDs.TemplateSection);

		item = $scItemManager.AddFromTemplate(packet.name, parentTemplate.ID, template.InnerItem, new $scID(packet.id));

		if (item.Name != packet.name) {
			item.Editing.BeginEdit();

			item.Name = packet.name;

			item.Editing.AcceptChanges();
		}
	}

	for (var j = 0; j < packet.fields.length; j++) {
		packet.fields[j].templateId = packet.templateId;
		packet.fields[j].sectionId = item.ID.Guid.ToString();
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
	var template = $sc.db.GetTemplate(packet.templateId);

	var section = template.GetSection(new $scID(packet.sectionId));

	var item;

	$sc.log("section = " + section.FullName);

	if (packet.id == null) {
		item = section.AddField(packet.name);
	}
	else {
		var parentTemplate = $sc.db.Templates.Item.get($scTemplateIDs.TemplateField);

		item = $scItemManager.AddFromTemplate(packet.name, parentTemplate.ID, section.InnerItem, new $scID(packet.id));

		if (item.Name != packet.name) {
			item.Editing.BeginEdit();

			item.Name = packet.name;

			item.Editing.AcceptChanges();
		}
	}

	var properties = {};

	for (var name in packet) {
		if (name == 'id') {
			continue;
		}
		else if (name == 'templateId') {
			continue;
		}
		else if (name == 'sectionId') {
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
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];

		scInsertStandardValue(packet);
	}
};

var scInsertStandardValue = function (packet) {

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
