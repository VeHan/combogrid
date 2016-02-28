$(function() {
    $.widget("custom.combobox", {
        _create: function() {
            this.wrapper = $("<span>")
                .addClass("custom-combobox")
                .insertAfter(this.element);

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },

        _createAutocomplete: function() {
            var selected = this.element.children(":selected"),
                value = selected.val() ? selected.text() : "";

            this.input = $("<input>")
                .appendTo(this.wrapper)
                .val(value)
                .attr("title", "")
                .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: $.proxy(this, "_source")
                })
                .tooltip({
                    tooltipClass: "ui-state"
                });

            this._on(this.input, {
                autocompleteselect: function(event, ui) {
                    ui.item.option.selected = true;
                    this._trigger("select", event, {
                        item: ui.item.option
                    });
                },

                autocompletechange: "_removeIfInvalid"
            });
        },

        _createShowAllButton: function() {
            var input = this.input,
                wasOpen = false;

            $("<a>")
                .attr("tabIndex", -1)
                //                            .attr( "title", "Show All Items" )
                .tooltip()
                .appendTo(this.wrapper)
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass("ui-corner-all")
                .addClass("custom-combobox-toggle ui-corner-right")
                .mousedown(function() {
                    wasOpen = input.autocomplete("widget").is(":visible");
                })
                .click(function() {
                    input.focus();

                    // Close if already visible
                    if (wasOpen) {
                        return;
                    }

                    // Pass empty string as value to search for, displaying all results
                    input.autocomplete("search", "");
                });
        },

        _source: function(request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            response(this.element.children("option").map(function() {
                var text = $(this).text();
                if (this.value && (!request.term || matcher.test(text)))
                    return {
                        label: text,
                        value: text,
                        option: this
                    };
            }));
        },

        _removeIfInvalid: function(event, ui) {

            // Selected an item, nothing to do
            if (ui.item) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
                valueLowerCase = value.toLowerCase(),
                valid = false;
            this.element.children("option").each(function() {
                if ($(this).text().toLowerCase() === valueLowerCase) {
                    this.selected = valid = true;
                    return false;
                }
            });

            // Found a match, nothing to do
            if (valid) {
                return;
            }

            // Remove invalid value
            this.input
                .val("")
                .attr("title", value + " didn't match any item")
                .tooltip("open");
            this.element.val("");
            this._delay(function() {
                this.input.tooltip("close").attr("title", "");
            }, 2500);
            this.input.autocomplete("instance").term = "";
        },

        _destroy: function() {
            this.wrapper.remove();
            this.element.show();
        }
    });
});


var combogrid = {
    combogrid: function($element, dataOpts) {

        /**
         * 过滤数据
         * @param  {[type]} data   [description]
         * @param  {[type]} option [description]
         * @return {[type]}        [description]
         */
        function findDataBy(data, option) {
            var result = [];
            $.each(data, function(index, dataVal) {
                var flag = true;
                $.each(option, function(name, value) {
                    flag = flag && dataVal[name] == value;
                });
                if (flag) {
                    result[result.length] = dataVal;
                }
            });
            return result;
        }




        /**
         * 收集过滤参数
         * @param  {[type]} index    [最后一个下拉选项的索引] 
         * @param  {[type]} dataOpts [description]
         * @param  {[type]} $title   [description]
         * @return {[type]}          [description]
         */
        function collectFilterOption(index, dataOpts, $title) {
            var option = {};
            for (var j = index; j >= 0; j--) {
                var inputVal = $($title.find('th').get(j)).find('input').val();
                if (inputVal) {
                    option[dataOpts.columns[j].name] = inputVal;
                }
            }
            return option;
        }


        //清空数据
        var elementData = null;
        $element.css({
            'height': '100%',
            'overflow-y': 'hidden'
        });
        $element.prop('dataOpts', dataOpts);
        $element.empty();

        //初始化表格
        var $table = $('<table></table>');
        $table.css({
            'width': '100%',
        });
        var $title = $('<tr></tr>');
        $title.css('width', '100%');
        if (dataOpts && dataOpts.columns) {
            $.each(dataOpts.columns, function(index, val) {
                var $th = $('<th></th>');
                var $select = $('<select></select>');
                $th.append($select);
                $select.combobox({
                    select: function(event, ui) {
                        if ($select.find(' [value=' + $(this).val() + ']').size() !== 0) {
                            $th.find('input').val(ui.item.label);
                            var option = collectFilterOption(index, dataOpts, $title);
                            elementData = window.sessionStorage.getItem(dataOpts.url);
                            elementData = $.parseJSON(elementData);
                            var data = findDataBy(elementData, option, index + 1);
                            combogrid.inflateTitle(data, dataOpts, $title, index + 1);
                            combogrid.inflateTable(data, dataOpts, $table);
                        }
                    }
                });
                if ($(this).attr('width')) {
                    $th.css('width', $(this).attr('width'));
                }
                if ($(this).attr('title')) {
                    $th.find('input').prop('placeholder', $(this).attr('title'));
                }
                $th.appendTo($title);
            });
        }
        var $titleWrapper = $("<div><table width='100%'></table></div>");
        $titleWrapper.css({
            'width': '100%',
            'padding-right': '17px'
        });
        var $tableWrapper = $("<div></div>");
        $tableWrapper.css({
            "overflow-y": "scroll",
            width: '100%',
            height: '93%'
        });

        $title.appendTo($titleWrapper.find('table'));
        $titleWrapper.appendTo($element);
        $table.appendTo($tableWrapper);
        $tableWrapper.appendTo($element);
        $element.prop('tableObj', $table);
        $element.prop('titleObj', $title);

        // 初始化遮罩
        var $mask = $("<div class='combogrid_mask'></div>");
        $mask.css({
            'position': 'absolute',
            'width': '100%',
            'height': '100%',
            'top': '0',
            'display': 'none',
            'z-index': '1',
            'background-color': 'rgba(0,0,0,.2)'
        });
        $element.css({
            'position': 'relative',
            'z-index': '0'
        });
        $mask.appendTo($element);

        //发起ajax请求
        if (dataOpts.url) {
            elementData = window.sessionStorage.getItem(dataOpts.url);
            if (elementData) {
                elementData = $.parseJSON(elementData);
                combogrid.inflateTitle(elementData, dataOpts, $title, 0);
                combogrid.inflateTable(elementData, dataOpts, $table);
            } else {
                combogrid.refresh($element);
            }
        }
    },
    /**
     * 对表格进行遮罩
     * @param  {[type]}  $element [description]
     * @param  {Boolean} isMask   [description]
     * @return {[type]}           [description]
     */
    mask: function($element, isMask) {
        if (isMask) {
            $element.children('.combogrid_mask').css('display', 'block');
        } else {
            $element.children('.combogrid_mask').css('display', 'none');
        }
    },
    getTable: function($element) {
        return $element.prop('tableObj');
    },
    /**
     * 刷新表格
     * @param  {[type]} $element [description]
     * @return {[type]}          [description]
     */
    refresh: function($element) {
        var dataOpts = $element.prop('dataOpts');
        $.ajax({
            url: dataOpts.url,
            dataType: 'json',
            success: function(data) {
                window.sessionStorage.setItem(dataOpts.url, JSON.stringify(data));
                combogrid.inflateTitle(data, dataOpts, $element.prop('titleObj'), 0);
                combogrid.inflateTable(data, dataOpts, $element.prop('tableObj'));
            }
        });
    },
    /**
     * 填充表格数据
     * @param  {[type]} data   [description]
     * @param  {[type]} dataOpts [description]
     * @param  {[type]} $table [description]
     * @return {[type]}        [description]
     */
    inflateTable: function(data, dataOpts, $table) {
        $table.find('tr').remove();
        $.each(data, function(index, dataVal) {
            var $tr = $('<tr></tr>');
            $.each(dataOpts.columns, function(index, columnVal) {
                var $td = $('<td></td>');
                $td.html(dataVal[columnVal.name]);
                $td.appendTo($tr);
                if ($(this).attr('width')) {
                    $td.css('width', $(this).attr('width'));
                }
            });
            $tr.appendTo($table);
            if (dataOpts.onRowClick) {
                $tr.click(function(event) {
                    dataOpts.onRowClick(dataVal);
                });
            }
        });

        $table.find("tr").css({
            "height": "24px",
            "cursor": "hover",
            "line-height": "24px"
        });
        $table.find("tr td").css("border", "1px solid #b4b4b4");

        $table.find("tr").on("mouseover", function() {
            $(this).css("background-color", "#f0f0f0");
        });
        $table.find("tr").on("mouseout", function() {
            $(this).css("background-color", "#ffffff");
        });
    },
    /**
     *  填充title数据
     * @param  {[type]} data     [description]
     * @param  {[type]} dataOpts [description]
     * @param  {[type]} $title   [description]
     * @param  {[type]} index    [从第index个索引开始填充]
     * @return {[type]}          [description]
     */
    inflateTitle: function(data, dataOpts, $title, index) {
        for (var i = index; i < dataOpts.columns.length; i++) {
            var $thTemp = $title.find('th:nth(' + i + ')');
            $thTemp.find('input').val(null);
            $thTemp.find('select').empty();
            var columnName = dataOpts.columns[i].name;
            $.each(data, function(index, el) {
                if ($thTemp.find(" [value='" + el[columnName] + "']").size() === 0) {
                    var $option = $('<option></option>');
                    $option.prop('value', el[columnName]);
                    $option.text(el[columnName]);
                    $option.appendTo($thTemp.find('select'));
                }
            });
        }
    }
};
