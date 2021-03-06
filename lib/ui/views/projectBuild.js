/*
 * Copyright 2013 BlackBerry Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ProjectBuildView,
    projectBuildTemplate,
    TargetSelectorView = require("./targetSelector");

function renderSubviews(model) {
    // target list
    window.views.targetSelector.setElement($("#targetNameList"));
    window.views.targetSelector.display(model);
}

ProjectBuildView = Backbone.View.extend({
    initialize: function () {
        // Find the template and save it
        $.get("pages/builder.html", function (data) {
            projectBuildTemplate = data;
        });

        window.views.targetSelector = new TargetSelectorView();
    },
    render: function () {
        // Use the template to create the html to display
        var template,
            view = this;

        this.model.getBB10Config(function (response) {
            template = _.template(projectBuildTemplate, {
                buildSettings: view.model.get("buildSettings") || {device: true, debug: true},
                widget: view.model.get("config").widget,
                passwords: view.model.getPasswords()
            });

        // Put the new html inside of the assigned element
            view.$el.html(template);

            renderSubviews(view.model);
        });
    },
    events: {
        "click #buildAndInstall" : "buildAndInstallProject",
        "click #install" : "installProject",
        "click #build" : "buildProject",
        "change #buildMode" : "saveBuildSettings",
        "change #targetType" : "updateDropDown",
        "change #targetNameList" : "saveBuildSettings",
        "change .build-passwords" : "saveBuildSettings"
    },
    buildAndInstallProject: function (event) {
        var options = {
            devicePassword: $("#devicePassword").val(),
            keystorePassword: $("#keystorePassword").val(),
            debug: $("#buildMode input:radio:checked").val() === "debug",
            device: $("#targetType input:radio:checked").val() === "device",
            targetName: $("#targetNameDropDown").val()
        };

        this.model.install(options, function (output) {
            window.views.dialogBox.hide();
            $("#build-log").text(output.stdout + output.stderr);
        });

        // Display dialog
        window.views.dialogBox.display({body: "Building and installing..."});
    },
    installProject: function (event) {
        var options = {
            devicePassword: $("#devicePassword").val(),
            keystorePassword: $("#keystorePassword").val(),
            debug: $("#buildMode input:radio:checked").val() === "debug",
            device: $("#targetType input:radio:checked").val() === "device",
            targetName: $("#targetNameDropDown").val()
        };

        this.model.installSkipBuild(options, function (output) {
            window.views.dialogBox.hide();
            $("#build-log").text(output.stdout + output.stderr);
        });

        // Display dialog
        window.views.dialogBox.display({body: "Installing..."});
    },
    buildProject: function (event) {
        var options = {
            keystorePassword: $("#keystorePassword").val(),
            debug: $("#buildMode input:radio:checked").val() === "debug",
            device: $("#targetType input:radio:checked").val() === "device"
        };

        this.model.build(options, function (output) {
            window.views.dialogBox.hide();
            $("#build-log").text(output.stdout + output.stderr);
        });

        // Display dialog
        window.views.dialogBox.display({body: "Building..."});
    },
    display: function (model) {
        this.model = model;
        this.render();
    },
    saveBuildSettings: function () {
        var settings = {
                device: $("#targetType input:radio:checked").val() === "device",
                debug: $("#buildMode input:radio:checked").val() === "debug"
            },
            passwords = {
                devicePassword: $("#devicePassword").val(),
                keystorePassword: $("#keystorePassword").val()
            };

        this.model.set("buildSettings", settings);
        this.model.setPasswords(passwords);
    },
    updateDropDown: function () {
        this.saveBuildSettings();
        window.views.targetSelector.display(this.model);
    }
});

module.exports = ProjectBuildView;
