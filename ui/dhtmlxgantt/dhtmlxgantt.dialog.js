TW.IDE.Dialogs.GanttCustomEditor = function () {
  const BASEURL = "../Common/extensions/dhtmlxgantt/ui/dhtmlxgantt";
  const BASEID = "dhtmlxgantt-dialog";

  const COLUMNCONFIG = [
    { name: "index", type: "button", width: "4%", defaultValue: undefined },
    { name: "label", type: "text", width: "13%", defaultValue: "" },
    { name: "name", type: "text", width: "13%", defaultValue: "" },
    { name: "resize", type: "boolean", width: "13%", defaultValue: false },
    { name: "tree", type: "boolean", width: "13%", defaultValue: false },
    {
      name: "width",
      type: "text",
      format: "[0-9*]",
      width: "13%",
      defaultValue: 0,
    },
    {
      name: "align",
      type: "list",
      items: ["left", "center", "right"],
      width: "13%",
      defaultValue: "left",
    },
  ];

  let thisWidget;

  this.renderDialogHtml = (widgetObj) => {
    thisWidget = widgetObj;

    return `<div class="widget-content ${BASEID}">
        <h2>
            DhtmlxGantt Setting
        </h2>

        <header>
            <ul>
                <li class="active">
                    <span id="${BASEID}-header">
                      header
                    </span>
                </li>
                <li>
                    <span id="${BASEID}-column">
                      column
                    </span>
                </li>
                <li class="inVisible">
                    <span id="${BASEID}-config">
                      config
                    </span>
                </li>
            </ul>
        </header>

        <main>
            <section class="${BASEID}-header-config"></section>
            <section class="${BASEID}-column-config inVisible"></section>
            <section class="${BASEID}-config-config inVisible">config</section>
        </main>

    </div>`;
  };

  this.afterRender = (domElementId) => {
    this.jqElementId = domElementId;
    this.jqElement = document.querySelector("#" + domElementId);

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
    .${BASEID} main section.${BASEID}-header-config {
        ${HeaderStyleBG}
        ${HeaderStyleBorder}
        ${HeaderStyleText}
        ${HeaderStyleLabelText}
        ${HeaderStyleLabelTextSize}
    }`;

    const resource = TW.IDE.getMashupResource();
    resource.styles.append(widgetStyles);

    /* Tab Event Add START */

    this.jqElement
      .querySelectorAll(`.${BASEID} header ul li span`)
      .forEach((element) => {
        element.addEventListener("click", (event) => {
          this.jqElement
            .querySelectorAll(`.${BASEID} header ul li`)
            .forEach((li) => {
              li.classList.remove("active");
            });
          this.jqElement
            .querySelectorAll(`.${BASEID} main section`)
            .forEach((section) => {
              section.classList.add("inVisible");
            });

          const { id } = event.target;
          event.target.parentNode.classList.add("active");
          this.jqElement
            .querySelector(`.${BASEID} main section.${id}-config`)
            .classList.remove("inVisible");
        });
      });

    /* Tab Event Add END */

    /* Header Tab Add START */
    headerDialogSectionAppend();
    /* Header Tab Add END */

    /* Column Tab Add START */
    columnDialogSectionAppend();
    /* Column Tab Add END */
  };

  const headerDialogSectionAppend = () => {
    const sectionElement = this.jqElement.querySelector(
      `.${BASEID} main section[class*=-header-config]`
    );

    const headerLeftSideElement = appendHeaderSide("left");
    const headerRightSideElement = appendHeaderSide("right");

    sectionElement.appendChild(headerLeftSideElement);
    sectionElement.appendChild(headerRightSideElement);
  };

  const appendHeaderSide = (side) => {
    const headers = thisWidget.getProperty("headers");
    const properties =
      typeof headers === "object" ? headers[side] : JSON.parse(headers)[side];

    const ulElement = document.createElement("ul");
    properties.forEach(({ name, visible }) => {
      const { text, type } = thisWidget.HEADERS[name];

      const liElement = document.createElement("li");

      const labelElement = document.createElement("label");
      labelElement.for = `${BASEID}-${name}`;

      const checkBoxElement = document.createElement("input");
      checkBoxElement.type = "checkbox";
      checkBoxElement.id = `${BASEID}-${name}`;
      checkBoxElement.name = "gantt-header";
      checkBoxElement.checked = visible;
      checkBoxElement.dataset.side = side;
      checkBoxElement.dataset.name = name;

      const textElement = document.createElement("span");
      textElement.innerText = text;

      labelElement.appendChild(checkBoxElement);
      labelElement.appendChild(textElement);

      liElement.appendChild(labelElement);

      if (type === "list") {
        const listUlElement = document.createElement("ul");
        const selectorOptions = thisWidget.getProperty("selectorOptions");

        const options =
          typeof selectorOptions === "object"
            ? selectorOptions[name]
            : JSON.parse(selectorOptions)[name];

        options.forEach(({ name: optionName, visible }) => {
          const listLiElement = document.createElement("li");

          const listLabelElement = document.createElement("label");
          listLabelElement.for = `${BASEID}-${optionName}`;

          const listCheckBoxElement = document.createElement("input");
          listCheckBoxElement.type = "checkbox";
          listCheckBoxElement.id = `${BASEID}-${optionName}`;
          listCheckBoxElement.name = `${name}-option`;
          listCheckBoxElement.checked = visible;
          listCheckBoxElement.dataset.name = optionName;
          listCheckBoxElement.dataset.key = name;

          const listSpanElement = document.createElement("span");
          listSpanElement.innerText = optionName;

          listLabelElement.appendChild(listCheckBoxElement);
          listLabelElement.appendChild(listSpanElement);

          listLiElement.appendChild(listLabelElement);

          listUlElement.appendChild(listLiElement);
        });

        liElement.appendChild(listUlElement);
      }

      ulElement.appendChild(liElement);
    });

    return ulElement;
  };

  const columnDialogSectionAppend = () => {
    const sectionElement = this.jqElement.querySelector(
      `.${BASEID} main section[class*=-column-config]`
    );
    const tableElement = document.createElement("table");

    /* colgroup Add START */
    const colgroupElement = document.createElement("colgroup");
    COLUMNCONFIG.forEach(({ width }) => {
      const colElement = document.createElement("col");
      colElement.style.width = width;
      colgroupElement.appendChild(colElement);
    });
    tableElement.appendChild(colgroupElement);
    sectionElement.appendChild(tableElement);
    /* colgroup Add END */

    /* thead Add START */
    const theadElement = document.createElement("thead");
    const theadTrElement = document.createElement("tr");
    COLUMNCONFIG.forEach(({ name, type }) => {
      const thElement = document.createElement("th");

      if (type === "button") {
        const buttonElement = document.createElement("button");
        buttonElement.innerText = "+";
        thElement.appendChild(buttonElement);

        buttonElement.addEventListener("click", (event) => {
          const addRowElement = appendColumnRow();
          tableElement.querySelector("tbody").appendChild(addRowElement);
        });
      } else {
        const spanElement = document.createElement("span");
        spanElement.innerText = name;
        thElement.appendChild(spanElement);
      }

      theadTrElement.appendChild(thElement);
    });
    theadElement.appendChild(theadTrElement);
    tableElement.appendChild(theadElement);
    /* thead Add END */

    /* column value Add Start */
    const tbodyElement = appendColumnRows();
    tableElement.appendChild(tbodyElement);
    /* column value Add END */
  };

  const appendColumnRows = () => {
    const tbodyElement = document.createElement("tbody");
    const temp = thisWidget.getProperty("columns");
    const columns = typeof temp === "object" ? temp : JSON.parse(temp);
    columns.forEach((column) => {
      const trElement = appendColumnRow(column);
      tbodyElement.appendChild(trElement);
    });
    return tbodyElement;
  };

  const appendColumnRow = (column) => {
    const trElement = document.createElement("tr");
    const seqID = TW.uniqueId();
    trElement.id = seqID;
    COLUMNCONFIG.forEach(({ name, type, defaultValue, format, items }) => {
      const tdElement = document.createElement("td");
      const value = column?.[name] ? column[name] : defaultValue;
      if (type === "button") {
        const buttonElement = document.createElement("button");
        buttonElement.innerText = "–";
        tdElement.appendChild(buttonElement);

        buttonElement.addEventListener("click", (event) => {
          const { target } = event;
          const rowIndex = target.parentNode.parentNode.rowIndex - 1;
          const tbodyElement = target.parentNode.parentNode.parentNode;
          tbodyElement.deleteRow(rowIndex);
        });
      } else if (type === "list") {
        const selectElement = document.createElement("select");
        selectElement.name = seqID;
        selectElement.dataset.name = name;

        items.forEach((item) => {
          const optionElement = document.createElement("option");
          optionElement.innerText = item;
          optionElement.selected = value === item;
          selectElement.appendChild(optionElement);
        });
        tdElement.appendChild(selectElement);
      } else if (type === "boolean") {
        const checkboxElement = document.createElement("input");
        checkboxElement.type = "checkbox";
        checkboxElement.checked = value;
        checkboxElement.name = seqID;
        checkboxElement.dataset.name = name;
        tdElement.appendChild(checkboxElement);
      } else {
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = value;
        inputElement.name = seqID;
        inputElement.dataset.name = name;
        if (format) {
          inputElement.addEventListener("keypress", (event) => {
            const { key } = event;
            const regexp = new RegExp(format);
            if (!regexp.exec(key)) {
              event.preventDefault();
            }
          });
        }
        tdElement.appendChild(inputElement);
      }
      trElement.appendChild(tdElement);
    });
    return trElement;
  };

  this.updateProperties = (widgetObj) => {
    /* Headers Set Property START */
    const updateHeaders = { left: [], right: [] };
    const settingHeaders = this.jqElement.querySelectorAll(
      `.${BASEID} main section.${BASEID}-header-config input[name=gantt-header]`
    );
    settingHeaders.forEach(({ checked: visible, dataset: { name, side } }) => {
      updateHeaders[side].push({
        name,
        visible,
      });
    });
    widgetObj.setProperty("headers", updateHeaders);
    /* Headers Set Property END */

    /* selectorOptions Set Property START */
    const updateOptions = {};
    const settingViewOptions = this.jqElement.querySelectorAll(
      `.${BASEID} main section.${BASEID}-header-config input[name=view-option]`
    );
    settingViewOptions.forEach(
      ({ checked: visible, dataset: { name, key } }) => {
        const arr = updateOptions?.[key] ? updateOptions[key] : [];
        arr.push({ name, visible });
        updateOptions[key] = arr;
      }
    );
    widgetObj.setProperty("selectorOptions", updateOptions);
    /* selectorOptions Set Property END */

    /* columns Set Property START */
    const updateColumns = [];
    const settingColumns = this.jqElement.querySelectorAll(
      `.${BASEID} main section.${BASEID}-column-config table tbody tr`
    );
    settingColumns.forEach((settingColumn, index) => {
      const columnID = settingColumn.id;
      const columns = settingColumn.querySelectorAll(`*[name="${columnID}"]`);

      const object = {};
      columns.forEach(({ dataset: { name }, value, checked, type }) => {
        if (type === "checkbox") {
          object[name] = checked;
        } else {
          object[name] = value;
        }
      });
      updateColumns.push(object);
    });
    widgetObj.setProperty("columns", updateColumns);
    /* columns Set Property END */

    return true;
  };
};
