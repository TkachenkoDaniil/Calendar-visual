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
    private weekday = ["so", "mo", "tu", "we", "th", "fr", "sa"];
    private weekdays = ["sos", "mos", "tus", "wes", "ths", "frs", "sas"];
    private thead: d3.Selection<HTMLTableRowElement, unknown, HTMLElement, any>;
    private arrayDate:Date[] = new Array();

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        if (document) {
        // var table = d3.select(this.target)
        //     .append("table")
        //     .attr("class", "table")
        //     .attr("id", "calendar")
        //     .attr("id", 1);

        // var theadTbody = d3.select("table")
        //     .append("thead");
        // var shyr = d3.select("table")
        //     .append("tbody");

        // this.thead = d3.select("thead")
        //     .append("tr");

        // var tr = this.thead.selectAll("tr");

        // var das = d3.selectAll("th")
        //     .data(this.weekday);
        // das
        //     .enter()
        //     .append("th")
        //     .text(d => d);

        // var tbody = theadTbody.select("tbody")
        //     .append("tr")

        //     .select("tr")
        //     .selectAll("td")
        //     .data(this.weekdays)
        //     .enter()
        //     .append("td")
        //     .text(d => d);

        //Лучше не вставлять html строки хардкодом, а использовать методы d3 для этого.
        let row = "<table class='table' id='calendar' border='1'><thead><tr><th>su</th><th>mo</th><th>tu</th><th>we</th><th>th</th><th>fr</th><th>sa</th></tr></thead><tbody></tbody></table>";
        this.target.innerHTML += row;

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
                this.date = new Date(this.date.getFullYear(), this.date.getMonth()-1, 1);
                this.target.getElementsByTagName('tbody')[0].innerHTML = '';
                this.fillCalendar();});

        const buttonRight = d3.select(this.target)
            .append("input")
            .attr("class", "switch")
            .attr("value", ">")
            .attr("type", "button")
            .on("click", () => {
                this.date = new Date(this.date.getFullYear(), this.date.getMonth()+1, 1);
                this.target.getElementsByTagName('tbody')[0].innerHTML = '';
                this.fillCalendar();});

            this.date = new Date();
            this.date.setDate(1);

            this.fillCalendar();
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        let arrayDate:Date[] = new Array();
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

        let view = dv[0].categorical;
        let categories = view.categories[0];
        let values = categories.values;

        //лучше сделать так
        //for (let i = 0; i < values.length; i++) { 
        for (let i = 0, len = values.length; i < len; i++) {
            let currentDate = new Date(values[i].toString());
            this.arrayDate.push(currentDate);
        }

        return this.arrayDate;
    }

    private getAllDates(dayOfWeek: number, prevMonthLastDay: Date, lastDay: number): number[][] { // заполнение массива дней месяца. только для d3
        let allDates: number[][];
        return allDates;
    }

    private fillCalendar() {
        this.target.getElementsByTagName('tbody')[0].innerHTML = '';
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

        let row = '';
        row += '<tr>';
        if (dayOfWeek != 0) {
          for(let i = this.newDate.getDate(); i != prevMonthLastDay.getDate()+1; i++){
            row += '<td></td>'
            this.newDate.setDate(this.newDate.getDate() + 1);
          }
        }
        for(let j = this.newDate.getDate(); j != lastDay + 1; j ++){
          if(this.newDate.getDay() == 0){
            row += '</tr><tr>'
          }
          if (this.newDate.getDay() == 0 || this.newDate.getDay() == 6 || this.arrayDate.some(date => {
            return date.getFullYear() == this.newDate.getFullYear() && date.getMonth() == this.newDate.getMonth() && date.getDate() == this.newDate.getDate();
          }))
          {
            row += "<td>" + '<font color="red">' + this.newDate.getDate() + "</font>" + "</td>";
            this.newDate.setDate(this.newDate.getDate() + 1);
          }
          else {
            row += "<td>" + this.newDate.getDate() + "</td>";
            this.newDate.setDate(this.newDate.getDate() + 1);
          }
        }
        row += '</tr>'
        this.target.getElementsByTagName('tbody')[0].innerHTML += row;
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}