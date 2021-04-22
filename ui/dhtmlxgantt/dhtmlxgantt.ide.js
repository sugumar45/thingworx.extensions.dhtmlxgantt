TW.IDE.Widgets.dhtmlxgantt = function () {
  //   constructor(this);

  const BASEURL = "../Common/extensions/dhtmlxgantt/ui/dhtmlxgantt";
  const HEADERS = {
    collapse: {
      img: `${BASEURL}/images/ic_collapse_all_24.png`,
      type: "text",
      text: "collapse all",
    },
    expand: {
      img: `${BASEURL}/images/ic_expand_all_24.png`,
      type: "text",
      text: "expand all",
    },
    export: {
      img: `${BASEURL}/images/ic_critical_path_24.png`,
      type: "text",
      text: "template export",
    },
    view: {
      img: `${BASEURL}/images/ic_zoom_in.png`,
      type: "list",
      text: "view",
    },
    fullscreen: {
      img: `${BASEURL}/images/ic_fullscreen_24.png`,
      type: "text",
      text: "fullscreen",
    },
  };
  this.HEADERS = HEADERS;

  const SELECTOROPTIONS = {
    view: [
      { name: "hours", visible: true },
      { name: "day", visible: true },
      { name: "weeks", visible: true },
      { name: "months", visible: true },
      { name: "quarters", visible: true },
      { name: "years", visible: true },
    ],
  };
  this.SELECTOROPTIONS = SELECTOROPTIONS;

  const DEFAULTCOLUMNS = [
    { label: "", name: "text", resize: true, tree: true, width: "*" },
    { label: "", align: "center", name: "start_date", resize: true },
    { label: "", align: "center", name: "duration" },
    { label: "", name: "add", width: 44 },
  ];

  const thisWidget = this;

  this.widgetIconUrl = () => `${BASEURL}/images/icon1.svg`;

  this.widgetProperties = () => {
    return {
      name: "Dhtmlx-Gantt",
      description: "",
      isContainer: true,
      supportsAutoResize: true,
      customEditor: "GanttCustomEditor",
      customEditorMenuText: "DhtmlxGantt Setting",
      category: ["Charts"],
      properties: {
        headers: {
          description: "",
          baseType: "JSON",
          defaultValue: {
            left: [
              { name: "collapse", visible: true },
              { name: "expand", visible: true },
              { name: "export", visible: true },
            ],
            right: [
              { name: "view", visible: true },
              { name: "fullscreen", visible: true },
            ],
          },
          isVisible: false,
        },
        headerStyle: {
          description: "",
          baseType: "STYLEDEFINITION",
          defaultValue: "DefaultDhtmlxGanttHeaderStyle",
        },
        selectorOptions: {
          description: "",
          baseType: "JSON",
          defaultValue: SELECTOROPTIONS,
          isVisible: false,
        },
        columns: {
          description: "",
          baseType: "JSON",
          defaultValue: DEFAULTCOLUMNS,
          isVisible: false,
        },
        ganttConfig: {
          description: "",
          baseType: "JSON",
          defaultValue: {
            readonly: true, //읽기전용
            drag_progress: false, //진척률 드래그
            date_format: "%Y/%m/%d", //date format
            date_grid: "%Y/%m/%d", //date format
            task_date: "%Y/%m/%d", //date format
            open_tree_initially: true, //초기에 gantt tree 열기
            work_time: true, //주말 제외 duration
            show_progress: true, //진척률 표시
            row_height: 40,
            task_height: 16,
          },
          isVisible: false,
        },
        ganttData: {
          description: "",
          baseType: "JSON",
          isBindingTarget: true,
        },
      },
    };
  };

  const changeMode = (developermode) => {
    const DEVMODE = ["ganttConfig"];
    const allWidgetProps = thisWidget.allWidgetProperties().properties;
    DEVMODE.forEach((dev) => {
      allWidgetProps[dev].isVisible = developermode;
    });
    TW.IDE.updateWidgetPropertiesWindow();
  };

  this.developerMode = () => changeMode(true);

  this.normalMode = () => changeMode(false);

  this.afterSetProperty = (name, value) => {
    let refreshHtml = false;
    switch (name) {
      case "Description":
        if (value === "developermode") {
          this.developerMode();
        } else {
          this.normalMode();
        }
        break;
      case "headers":
      case "headerStyle":
      case "selectorOptions":
      case "columns":
      case "ganttConfig":
        refreshHtml = true;
        break;
      default:
        break;
    }
    return refreshHtml;
  };

  this.renderHtml = () =>
    `<div class="widget-content widget-dhtmlxgantt"></div>`;

  const appendHeaderSide = (side) => {
    const headers = thisWidget.getProperty("headers");
    const properties =
      typeof headers === "object" ? headers[side] : JSON.parse(headers)[side];

    const header = document.createElement("ul");
    properties.forEach(({ name, visible }) => {
      if (visible) {
        const { img, text, type } = HEADERS[name];

        const li = document.createElement("li");

        const imgElement = document.createElement("img");
        imgElement.src = img;
        imgElement.alt = text;
        li.appendChild(imgElement);

        if (type === "text") {
          const textElement = document.createElement("span");
          textElement.innerText = text;
          li.appendChild(textElement);
        } else if (type === "list") {
          const selectElement = document.createElement("select");

          const selectorOptions = thisWidget.getProperty("selectorOptions");

          const options =
            typeof selectorOptions === "object"
              ? selectorOptions[name]
              : JSON.parse(selectorOptions)[name];

          options.forEach(({ name, visible }) => {
            if (visible) {
              const optionElement = document.createElement("option");
              optionElement.innerText = name;

              selectElement.appendChild(optionElement);
            }
          });
          li.appendChild(selectElement);
        }

        header.appendChild(li);
      }
    });

    return header;
  };

  this.afterRender = () => {
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

    const resource = TW.IDE.getMashupResource();
    resource.styles.append(widgetStyles);

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
    gantt.init(`${jqElementId}__ganttChart`);
  };
};
