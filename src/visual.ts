"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import * as d3 from "d3";

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private date: Date;
    private newDate: Date;
    private monthText: d3.Selection<HTMLHeadingElement, unknown, null, undefined>;
    private yearText: d3.Selection<HTMLHeadingElement, unknown, null, undefined>;
    private weekdays = ["su", "mo", "tu", "we", "th", "fr", "sa"];
    private highlightWeekdays: boolean = true;

    private tbody: d3.Selection<HTMLTableSectionElement, unknown, null, undefined>
    private arrayDate: Date[] = new Array();

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;

        this.monthText = d3.select(this.target)
            .append("h3")
            .text("month");
        this.yearText = d3.select(this.target)
            .append("h3")
            .text("year");

        const buttonLeft = d3.select(this.target)
            .append("input")
            .attr("class", "switch")
            .attr("value", "<")
            .attr("type", "button")
            .on("click", () => {
                this.date = new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1);
                this.tbody
                    .selectAll("tr")
                    .remove();
                this.fillCalendar();
            });

        const buttonRight = d3.select(this.target)
            .append("input")
            .attr("class", "switch")
            .attr("value", ">")
            .attr("type", "button")
            .on("click", () => {
                this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);
                this.tbody
                    .selectAll("tr")
                    .remove();
                this.fillCalendar();
            });

        if (document) {
            try {

                let table = d3.select(this.target)
                    .append("table")
                    .classed("table", true);

                let thead = table
                    .append("thead");

                this.tbody = table.append("tbody");

                thead
                    .selectAll("th")
                    .data(this.weekdays)
                    .enter()
                    .append("th")
                    .text(d => d);
            }
            catch (e) {
                debugger;
            }

            this.date = new Date();
            this.date.setDate(1);

            this.fillCalendar();
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        this.updateSettings(options);

        let arrayDate: Date[] = new Array();
        this.arrayDate = this.getAllweekends(options);

        this.fillCalendar();
    }

    private getAllweekends(options: VisualUpdateOptions): Date[] {
        let dv = options.dataViews;
        if (!dv
            || !dv[0]
            || !dv[0].categorical.categories
            || !dv[0].categorical.categories[0].source
            || !dv[0].categorical.categories[0].values)
            return this.arrayDate;

        debugger;

        let view = dv[0].categorical;
        let categories = view.categories[0];
        let values = categories.values;
 
        for (let i = 0, len = values.length; i < len; i++) {
            let currentDate: Date = <Date>values[i];
            this.arrayDate.push(currentDate);
        }

        return this.arrayDate;
    }

    private fillCalendar() {

        this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
        let month = this.date.toLocaleString('ru', {
            month: 'long'
        });
        this.monthText
            .text(month);
        this.yearText
            .text(this.date.getFullYear());

        var prevMonthLastDay = new Date(this.newDate.getFullYear(), this.newDate.getMonth(), 0);
        let lastDay = new Date(this.newDate.getFullYear(), this.newDate.getMonth() + 1, 0).getDate();
        let dayOfWeek = this.newDate.getDay();

        this.newDate.setDate(this.newDate.getDate() - dayOfWeek);

        this.tbody
            .selectAll("tr")
            .remove();
        let currentRow = this.tbody
            .append("tr");

        if (dayOfWeek != 0) {
            for (let i = this.newDate.getDate(); i != prevMonthLastDay.getDate() + 1; i++) {
                currentRow
                    .append("td");
                this.newDate.setDate(this.newDate.getDate() + 1);
            }
        }
        for (let j = this.newDate.getDate(); j != lastDay + 1; j++) {
            if (this.newDate.getDay() == 0) {
                currentRow = this.tbody
                    .append("tr");
            }
            if (this.newDate.getDay() == 0 || this.newDate.getDay() == 6 || this.arrayDate.some(date => {
                return date.getFullYear() == this.newDate.getFullYear() && date.getMonth() == this.newDate.getMonth() && date.getDate() == this.newDate.getDate();
            })) {
                currentRow
                    .append("td")
                    //.classed("weekdays", true)
                    .attr("style", this.highlightWeekdays ? "color:red" : "")
                    .text(this.newDate.getDate());
                this.newDate.setDate(this.newDate.getDate() + 1);
            }
            else {
                currentRow
                    .append("td")
                    .text(this.newDate.getDate());
                this.newDate.setDate(this.newDate.getDate() + 1);
            }
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    private updateSettings(option: VisualUpdateOptions) {
        let dv = option.dataViews;

        debugger;
        if( !dv
            || !dv[0]
            || !dv[0].metadata
            || !dv[0].metadata.objects
            || !dv[0].metadata.objects.highlightWeekdays)
            return null;
        
        let metadata = dv[0].metadata;
        let objects = metadata.objects;
        let highlightWeekdays = objects.highlightWeekdays;
        this.highlightWeekdays = <boolean>highlightWeekdays.show;
        console.log(highlightWeekdays.show);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        let propertyGroupName = options.objectName;
        let properties: VisualObjectInstance[] = [];

        switch (propertyGroupName) {
            case "highlightWeekdays":
                properties.push({
                    objectName: propertyGroupName,
                    properties: {
                        show: this.highlightWeekdays
                    },
                    selector: null
                });
                break;
        };
        return properties;
    }
}