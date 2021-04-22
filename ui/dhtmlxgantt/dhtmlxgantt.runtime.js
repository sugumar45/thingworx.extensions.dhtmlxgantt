TW.Runtime.Widgets.dhtmlxgantt = function () {
  const thisWidget = this;
  const BASEURL = "../Common/extensions/dhtmlxgantt/ui/dhtmlxgantt";
  const HEADERS = {
    collapse: {
      img: `${BASEURL}/images/ic_collapse_all_24.png`,
      type: "text",
      text: "collapse all",
      event: () => {
        gantt.eachTask((task) => {
          task.$open = false;
        });
        gantt.render();
      },
    },
    expand: {
      img: `${BASEURL}/images/ic_expand_all_24.png`,
      type: "text",
      text: "expand all",
      event: () => {
        gantt.eachTask((task) => {
          task.$open = true;
        });
        gantt.render();
      },
    },
    export: {
      img: `${BASEURL}/images/ic_critical_path_24.png`,
      type: "text",
      text: "template export",
      event: (event) => {
        import("https://export.dhtmlx.com/beta/gantt/api.js?v=7.0.9")
          .then((response) => {
            return response;
          })
          .then((response) => {
            gantt.exportToPDF();
          })
          .catch((err) => {
            TW.Runtime.showStatusText("error", "관리자에게 문의하여 주세요.");
            TW.log.error(err);
          });
      },
    },
    view: {
      img: `${BASEURL}/images/ic_zoom_in.png`,
      type: "list",
      text: "view",
      event: (event) => {
        const {
          target: { value },
        } = event;
        gantt.ext.zoom.setLevel(value);
        gantt.render();
      },
    },
    fullscreen: {
      img: `${BASEURL}/images/ic_fullscreen_24.png`,
      type: "text",
      text: "fullscreen",
      event: () => {
        gantt.ext.fullscreen.toggle();
      },
    },
  };

  const ZOMCONFIG = {
    minColumnWidth: 80,
    maxColumnWidth: 150,
    activeLevelIndex: 0,
    levels: [
      {
        name: "hours",
        scales: [
          { unit: "day", step: 1, format: "%d %M" },
          { unit: "hour", step: 1, format: "%H" },
        ],
        round_dnd_dates: true,
        min_column_width: 30,
        scale_height: 40,
      },
      {
        name: "days",
        scales: [
          { unit: "month", step: 1, format: "%M" },
          { unit: "week", step: 1, format: "%W" },
          { unit: "day", step: 1, format: "%d (%D)" },
        ],
        round_dnd_dates: true,
        min_column_width: 60,
        scale_height: 60,
      },
      {
        name: "weeks",
        scales: [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: "%M" },
          { unit: "week", step: 1, format: "%W" },
        ],
        round_dnd_dates: false,
        min_column_width: 60,
        scale_height: 60,
      },
      {
        name: "months",
        scales: [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: "%M" },
        ],
        round_dnd_dates: false,
        min_column_width: 50,
        scale_height: 60,
      },
      {
        name: "quarters",
        scales: [
          { unit: "year", step: 1, format: "%Y" },
          {
            unit: "quarter",
            step: 1,
            format: function quarterLabel(date) {
              var month = date.getMonth();
              var q_num;

              if (month >= 9) {
                q_num = 4;
              } else if (month >= 6) {
                q_num = 3;
              } else if (month >= 3) {
                q_num = 2;
              } else {
                q_num = 1;
              }

              return "Q" + q_num;
            },
          },
          { unit: "month", step: 1, format: "%M" },
        ],
        round_dnd_dates: false,
        min_column_width: 50,
        scale_height: 60,
      },
      {
        name: "years",
        scales: [{ unit: "year", step: 1, format: "%Y" }],
        round_dnd_dates: false,
        min_column_width: 50,
        scale_height: 60,
      },
    ],
  };

  this.renderHtml = () =>
    '<div class="widget-content widget-dhtmlxgantt"></div>';

  this.renderStyles = () => {
    const jqElementId = thisWidget.jqElementId;
    /* Widget Style */
    const HeaderStyle = TW.getStyleFromStyleDefinition(
      thisWidget.getProperty("headerStyle")
    );

    const HeaderStyleBG = TW.getStyleCssGradientFromStyle(HeaderStyle);
    const HeaderStyleBorder = TW.getStyleCssBorderFromStyle(HeaderStyle);
    const HeaderStyleText = TW.getStyleCssTextualNoBackgroundFromStyle(
      HeaderStyle
    );
    const HeaderStyleLabelText = TW.getStyleCssTextualNoBackgroundFromStyle(
      HeaderStyle
    );
    const HeaderStyleLabelTextSize = TW.getTextSize(HeaderStyle.textSize);

    const widgetStyles = `
				#${jqElementId}.widget-dhtmlxgantt header {
					${HeaderStyleBG}
					${HeaderStyleBorder}
					${HeaderStyleText}
					${HeaderStyleLabelText}
					${HeaderStyleLabelTextSize}
				}
				`;
    return widgetStyles;
  };

  const appendHeaderSide = (side) => {
    const headers = thisWidget.getProperty("headers");
    const properties =
      typeof headers === "object" ? headers[side] : JSON.parse(headers)[side];

    const header = document.createElement("ul");
    properties.forEach(({ name, visible }) => {
      if (visible) {
        const { img, text, type, event: eventHandler } = HEADERS[name];

        const li = document.createElement("li");

        const imgElement = document.createElement("img");
        imgElement.src = img;
        imgElement.alt = text;
        li.appendChild(imgElement);

        if (type === "text") {
          const textElement = document.createElement("span");
          textElement.innerText = text;
          li.appendChild(textElement);

          li.addEventListener("click", eventHandler);
        } else if (type === "list") {
          const selectElement = document.createElement("select");

          const selectorOptions = thisWidget.getProperty("selectorOptions");

          const options =
            typeof selectorOptions === "object"
              ? selectorOptions[name]
              : JSON.parse(selectorOptions)[name];

          let defaultView;

          options.forEach(({ name, visible }, index) => {
            if (visible) {
              const optionElement = document.createElement("option");
              optionElement.innerText = name;
              optionElement.value = index;

              defaultView ?? (ZOMCONFIG.activeLevelIndex = index);
              defaultView = index;

              selectElement.appendChild(optionElement);
            }
          });
          selectElement.addEventListener("change", eventHandler);
          li.appendChild(selectElement);
        }

        header.appendChild(li);
      }
    });

    return header;
  };

  this.afterRender = () => {
    const jqElementId = thisWidget.jqElementId;

    /* Widget Element */
    const thisWidgetElement = thisWidget.jqElement[0];

    /* Header Add */
    const headerElement = document.createElement("header");

    /* Header Left */
    const headerLeftSide = appendHeaderSide("left");
    headerElement.appendChild(headerLeftSide);

    /* Header Right */
    const headerRightSide = appendHeaderSide("right");
    headerElement.appendChild(headerRightSide);

    /* Gantt Main */
    const ganttMain = document.createElement("main");
    ganttMain.id = `${jqElementId}__ganttChart`;

    /* widget append */
    thisWidgetElement.appendChild(headerElement);
    thisWidgetElement.appendChild(ganttMain);

    /* Gantt Config */
    const tempConfig = thisWidget.getProperty("ganttConfig");
    const ganttConfig =
      typeof tempConfig === "object" ? tempConfig : JSON.parse(tempConfig);

    gantt.config = {
      ...gantt.config,
      ...ganttConfig,
    };

    /* Gantt Column Setting */
    const columns = thisWidget.getProperty("columns");
    gantt.config.columns =
      typeof columns === "object" ? columns : JSON.parse(columns);

    /* Gantt render */
    gantt.plugins({
      fullscreen: true,
      tooltip: true,
      marker: true,
    });

    /* Gantt tooltip */
    const tooltipCode = thisWidget.getProperty("tooltip");
    gantt.templates.tooltip_text = new Function(
      "start_date",
      "end_date",
      "task",
      tooltipCode
    );

    gantt.ext.zoom.init(ZOMCONFIG);
    gantt.init(`${jqElementId}__ganttChart`);
  };
  this.updateProperty = function (updatePropertyInfo) {
    if (updatePropertyInfo.TargetProperty === "ganttData") {
      const datas = updatePropertyInfo.RawDataFromInvoke;
      gantt.parse(datas);
    } else if (updatePropertyInfo.TargetProperty === "markers") {
      const markers = updatePropertyInfo.RawDataFromInvoke.array;
      markers.forEach((marker) => {
        gantt.addMarker(marker);
      });
    }
  };
};
