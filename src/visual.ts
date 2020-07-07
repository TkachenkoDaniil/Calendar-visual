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
    private weekday = ["so", "mo", "tu", "we", "th", "fr", "sa"];

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        if (document) {
        // const table = d3.select(this.target)
        //     .append("table")
        //     .attr("class", "table")
        //     .attr("id", "calendar")
        //     .attr("id", 1);

        // this.theadTbody = d3.select("table")
        //     .append("thead")
        //     .append("tbody");

        // const thead = d3.select("thead")
        //     .append("tr");

        // // this.tbody = d3.select("tbody")
        // //     .append("tr");
        // // d3.select("tr")
        // //     .append("td")
        // //     .text("sfsdf");

        // const tr = d3.select("tr")
        //     .selectAll("th")
        //     .data(this.weekday)
        //     .enter()
        //     .append("th")
        //     .text(d => d);

        let row = "<table class='table' id='calendar' border='1'><thead><tr><th>su</th><th>mo</th><th>tu</th><th>we</th><th>th</th><th>fr</th><th>sa</th></tr></thead><tbody></tbody></table>";
        this.target.innerHTML += row;

        this.monthText = d3.select(this.target)
            .append("h3")
            .text("month");
        const buttonLeft = d3.select(this.target)
            .append("input")
            .attr("class", "switch")
            .attr("value", "<")
            .attr("type", "button")
            .on("click", () => {
                this.date = new Date(this.date.getFullYear(), this.date.getMonth()-1, 1);
                this.target.getElementsByTagName('tbody')[0].innerHTML = '';});

        const buttonRight = d3.select(this.target)
            .append("input")
            .attr("class", "switch")
            .attr("value", ">")
            .attr("type", "button")
            .on("click", () => {
                this.date = new Date(this.date.getFullYear(), this.date.getMonth()+1, 1);
                this.target.getElementsByTagName('tbody')[0].innerHTML = '';});

            this.date = new Date();
            this.date.setDate(1);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        this.target.getElementsByTagName('tbody')[0].innerHTML = '';
        this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
        let month = this.date.toLocaleString('ru', {
          month: 'long'
        });
        this.monthText
            .text(month);
        
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
          row += "<td>" + this.newDate.getDate() + "</td>";
          this.newDate.setDate(this.newDate.getDate() + 1);
        }
        row += '</tr>'
        this.target.getElementsByTagName('tbody')[0].innerHTML += row;
    }

    private getAllDates(dayOfWeek: number, prevMonthLastDay: Date, lastDay: number): number[][] { // заполнение массива дней месяца. только для d3
        let allDates: number[][];
        return allDates;
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}