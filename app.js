var editor;
editor = ace.edit("editor");
editor.session.setMode("ace/mode/sql");
editor.setValue("SELECT * FROM students;");
editor.renderer.setShowGutter(false);

editor.setOptions({
    showPrintMargin: false,
    highlightActiveLine: false,
});
$('[data-toggle="popover"],[data-original-title]').popover();

$(document).on('click', function (e) {
    $('[data-toggle="popover"],[data-original-title]').each(function () {
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide').data('bs.popover').inState.click = false
        }

    });
});
$('#expand_result').on('click', function (e) {
    $('#result_container').toggleClass('full_screen_result');
    $(this).toggleClass('glyphicon-resize-small');
    $('body').toggleClass('body_overflow_hidden');

});
$(document).on("click", "#expand_result", function (event) {
    $('#result_container').toggleClass('full_screen_result');
    $(this).toggleClass('glyphicon-resize-small');
    $('body').toggleClass('body_overflow_hidden');
});
$('.close_pin_database_info').on('click', function (e) {
    $('#database_info_container').toggleClass('display_none');
    $('#editor_result_container').toggleClass('width_100_per');
    $('#your_database_pin').toggleClass('display_block');
});
$('#pin_unpin_your_database').on('click', function (e) {
    $(this).toggleClass('disabled_color');
    $('#database_info').toggleClass('remove_fixed');
});

var webSQLOK = !!window.openDatabase;
if (webSQLOK === true) {
    webSQL = new webSQLInit();
} else {
    alert("Your browser does not support WebSQL")
}

function webSQLSubmit() {
    var txt;
    if (editor) {
//        editor.save();
    }
    if (webSQLOK === true) {
        webSQL.runSQL();
    } else {
        alert("Your browser does not support WebSQL");
    }
}

function writeDBInfo() {
    if (webSQLOK === true) {
        webSQL.myDatabase();
    } else {
        alert("Your browser does not support WebSQL");
    }
}

writeDBInfo();

var mainDatabase;

function webSQLInit() {
    var dbObj = this;
    mainDatabase = window.openDatabase('DemoDatabase', '1.0', 'Demo Database', 2 * 1024 * 1024);
    function dropTable(tablename) {
        var sql = "DROP TABLE [" + tablename + "]";
        mainDatabase.transaction(function (tx) {
            tx.executeSql(sql, []);
        }, function (err) {
            window.alert("Error 1: " + err.message);
        });
    }

    function dropView(tablename) {
        var sql = "DROP VIEW [" + tablename + "]";
        mainDatabase.transaction(function (tx) {
            tx.executeSql(sql, []);
        }, function (err) {
            window.alert("Error 2: " + err.message);
        });
    }

    function dropIndex(tablename) {
        var sql = "DROP INDEX [" + tablename + "]";
        mainDatabase.transaction(function (tx) {
            tx.executeSql(sql, []);
        }, function (err) {
            window.alert("Error 3: " + err.message);
        });
    }

    function checkDBChanges(x) {
        if (
                x.toUpperCase().indexOf("INSERT INTO ") > -1 ||
                x.toUpperCase().indexOf("UPDATE ") > -1 ||
                x.toUpperCase().indexOf("DELETE ") > -1 ||
                x.toUpperCase().indexOf("ALTER TABLE ") > -1 ||
                x.toUpperCase().indexOf("DROP TABLE ") > -1 ||
                x.toUpperCase().indexOf("INTO ") > -1 ||
                x.toUpperCase().indexOf("CREATE TABLE ") > -1 ||
                x.toUpperCase().indexOf("ALTER TABLE ") > -1 ||
                x.toUpperCase().indexOf("CREATE VIEW ") > -1 ||
                x.toUpperCase().indexOf("REPLACE VIEW ") > -1 ||
                x.toUpperCase().indexOf("DROP VIEW ") > -1 ||
                x.toUpperCase().indexOf("CREATE INDEX") > -1 ||
                x.toUpperCase().indexOf("CREATE UNIQUE INDEX") > -1 ||
                x.toUpperCase().indexOf("DROP INDEX") > -1
                ) {
            return true;
        }
        return false;
    }

    this.executeSQL = function (sql) {
        var resultContainer;
        resultContainer = document.getElementById("result_container");
        resultContainer.innerHTML = "";
        mainDatabase.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, results) {
                var len = results.rows.length, i, j, m, content, columns = [], DBChanges = 0;
                content = "";
                content = content + "<span> <h4 style='display: inline-block'>Result</h4><span id='expand_result' class='glyphicon glyphicon-resize-full'></span></span>"
                content = content + "<div id='result'>"
                        + "<pre id='query_editor' > " + sql + " </pre>";
                if (len > 0) {
                    content = content + "<h5 id='query_result'>Number of records : " + len + "</h5>";
                    content = content + "<table id='result_table' class='table table-bordered table-striped'><thead><tr>";

                    for (m in results.rows.item(0)) {
                        columns.push(m);
                    }
                    for (j = 0; j < columns.length; j++) {
                        content = content + "<th>" + columns[j] + "</th>";
                    }
                    content = content + "</tr></thead><tbody>";
                    for (i = 0; i < len; i++) {
                        content = content + "<tr>";
                        for (j = 0; j < columns.length; j++) {
                            if (results.rows.item(i)[columns[j]] == null) {
                                content = content + "<td><i>null</i></td>";
                            } else {
                                content = content + "<td>" + results.rows.item(i)[columns[j]] + "</td>";
                            }
                        }
                        content = content + "</tr>";
                    }
                    resultContainer.innerHTML = content + "</tbody></table></div>";
                } else {
                    DBChanges = checkDBChanges(sql);
                    if (DBChanges === true) {
                        content = content + "<h5 id='query_result'>You have made changes to the database.<br>";

                        if (results.rowsAffected > 0) {
                            content = content + " Rows affected: " + results.rowsAffected;
                        }
                        resultContainer.innerHTML = content + "</h5>";
                    } else {
                        content = "<h5 id='query_result'>No result.</h5>";
                        resultContainer.innerHTML = content;
                    }
                }
                dbObj.myDatabase();
            });
        }, function (err) {
            window.alert("Error 4: " + err.message);
        });
    };
    this.selectStar = function (tablename) {
        var sql = "SELECT * FROM " + tablename + "";
        document.getElementById("editor").value = sql;
        console.log(editor);
        if (editor) {
            editor.setValue(sql);
        }
        dbObj.executeSQL(sql);
    };

    //-------------------------

    this.myDatabase = function () {
        mainDatabase.transaction(function (tx) {
            var tblnames = [],
                    recordcounts = [],
                    viewnames = [],
                    viewrecordcounts = [],
                    indexnames = [];

            document.getElementById("tables").innerHTML = "";
            document.getElementById("views").innerHTML = "";
            document.getElementById("indexes").innerHTML = "";

            function dbInfo() {
                var content = "", i;
                content = content + "<div class='table-responsive'><table class='table database_table'><thead><tr>";
                content = content + "<th>Table name</th>";
                content = content + "<th>Total records</th>";
                content = content + "</tr></thead><tbody>";
                for (i = 0; i < tblnames.length; i++) {
                    content = content + "<tr>";
                    content = content + "<td title='Click to see the content of the " + tblnames[i] + " table' style='text-align:left;cursor:pointer;text-decoration:underline;' onclick='webSQL.selectStar(\"" + tblnames[i] + "\")'>" + tblnames[i] + "</td>";
                    content = content + "<td style='text-align:right;'>" + recordcounts[i] + "</td>";
                    content = content + "</tr>";
                }
                document.getElementById("tables").innerHTML = content + "</tbody></table>";
            }
            function dbViewInfo() {
                var content = "", i;
                content = content + "<div class='table-responsive'><table class='table database_views'><thead><tr>";
                content = content + "<th>View name</th>";
                content = content + "<th>Total records</th>";
                content = content + "</tr></thead><tbody>";
                for (i = 0; i < viewnames.length; i++) {
                    content = content + "<tr>";
                    content = content + "<td title='Click to see the content of the " + viewnames[i] + " view' style='text-align:left;cursor:pointer;text-decoration:underline;' onclick='webSQL.selectStar(\"" + viewnames[i] + "\")'>" + viewnames[i] + "</td>";
                    content = content + "<td style='text-align:right;'>" + viewrecordcounts[i] + "</td>";
                    content = content + "</tr>";
                }
                document.getElementById("views").innerHTML = content + "</tbody></table>";
            }
            function dbIndexInfo() {
                var content = "", i;
                content = content + "<div class='table-responsive'><table class='table database_indexes'><thead><tr>";
                content = content + "<th>Index name</th>";
                content = content + "</tr></thead><tbody>";
                for (i = 0; i < indexnames.length; i++) {
                    content = content + "<tr>";
                    content = content + "<td style='text-align:left;'>" + indexnames[i] + "</td>";
                    content = content + "</tr>";
                }
                document.getElementById("indexes").innerHTML = content + "</tbody></table>";
            }
            function makeRecordcountsArray(x) {
                var i, lastTable = false;
                for (i = 0; i < x.length; i++) {
                    if (i === (x.length - 1)) {
                        lastTable = true;
                    }
                    tx.executeSql("SELECT count(*) AS rc,'" + lastTable + "' AS i FROM [" + x[i] + "]", [], function (tx, results) {
                        var len = results.rows.length, k, cc = "";
                        if (len > 0) {
                            for (k = 0; k < len; k++) {
                                recordcounts.push(results.rows.item(k).rc);
                                cc = results.rows.item(k).i;
                            }
                            if (cc === "true") {
                                dbInfo();
                            }
                        } else {
                            window.alert("ERROR 5");
                        }

                    });
                }
            }
            function makeViewRecordcountsArray(x) {
                var i, lastTable = false;
                for (i = 0; i < x.length; i++) {
                    if (i === (x.length - 1)) {
                        lastTable = true;
                    }
                    tx.executeSql("SELECT count(*) AS rc,'" + lastTable + "' AS i FROM [" + x[i] + "]", [], function (tx, results) {
                        var len = results.rows.length, k, cc = "", txt;
                        if (len > 0) {
                            for (k = 0; k < len; k++) {
                                viewrecordcounts.push(results.rows.item(k).rc);
                                cc = results.rows.item(k).i;
                            }
                            if (cc === "true") {
                                dbViewInfo();
                            }
                        } else {
                            window.alert("ERROR 6");
                        }

                    });
                }
            }
            tx.executeSql("SELECT tbl_name FROM sqlite_master WHERE type='table' AND tbl_name NOT LIKE '__WebKitDatabaseInfoTable__' AND tbl_name NOT LIKE 'sqlite_sequence'", [], function (tx, results) {
                var len = results.rows.length, i;
                if (len > 0) {
                    for (i = 0; i < len; i++) {
                        tblnames.push(results.rows.item(i).tbl_name);
                    }
                    makeRecordcountsArray(tblnames);
                }
            });
            tx.executeSql("SELECT tbl_name FROM sqlite_master WHERE type='view'", [], function (tx, results) {
                var len = results.rows.length, i;
                if (len > 0) {
                    for (i = 0; i < len; i++) {
                        viewnames.push(results.rows.item(i).tbl_name);
                    }
                    makeViewRecordcountsArray(viewnames);
                }
            });
            tx.executeSql("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name NOT LIKE '__WebKitDatabaseInfoTable__'", [], function (tx, results) {
                var len = results.rows.length, i;
                if (len > 0) {
                    for (i = 0; i < len; i++) {
                        indexnames.push(results.rows.item(i).name);
                    }
                    dbIndexInfo();
                }
            });
        }, function (err) {
            window.alert("ERROR 7" + err.message);
        });
    };


    //        ------------------

    this.initDatabase = function (n) {
        dbObj.initColleges();
        dbObj.initStudents(n);
    };

    //    -----------

    this.clearDatabase = function () {
        var warn = window.confirm("This action will restore the database back to its original content.\n\nAre you sure you want to continue?");
        if (warn === false) {
            return false;
        }
        document.getElementById("result_container").innerHTML = "";
        if (mainDatabase) {
            mainDatabase.transaction(function (tx) {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='index' AND name<>'sqlite_autoindex___WebKitDatabaseInfoTable___1'", [], function (tx, results) {
                    var len = results.rows.length, i;
                    if (len > 0) {
                        for (i = 0; i < len; i++) {
                            dropIndex(results.rows.item(i).name);
                        }
                    }
                });
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='view'", [], function (tx, results) {

                    var len = results.rows.length, i;
                    if (len > 0) {
                        for (i = 0; i < len; i++) {
                            dropView(results.rows.item(i).name);
                        }
                    }
                });
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name<>'sqlite_sequence' AND name<>'__WebKitDatabaseInfoTable__'", [], function (tx, results) {
                    var len = results.rows.length, i;
                    if (len > 0) {
                        for (i = 0; i < len; i++) {
                            dropTable(results.rows.item(i).name);
                            if (i === (len - 1)) {
                                dbObj.initDatabase(1);
                            }
                        }
                    } else {
                        dbObj.initDatabase(1);
                    }
                });
            }, function (err) {
                window.alert("Error 8: " + err.message);
            });
        }
    };

    //    --------


    this.initColleges = function () {
        mainDatabase.transaction(function (tx) {
            tx.executeSql('CREATE TABLE colleges (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,name NVARCHAR(255),location NVARCHAR(255), seats INTEGER)', [], function (tx) {
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("Delhi University","Delhi", 189)');
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("GITAM","Vizag", 255)');
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("VIT","Vellore", 612)');
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("JNTU","Hyderabad", 190)');
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("Andhra University","Vizag", 149)');
                tx.executeSql('INSERT INTO colleges (name,location, seats) VALUES ("IIT Madras","Chennai", 220)');
            });
        }, function (err) {
            if (err.message.indexOf("colleges already exists") === -1) {
                window.alert("Error 9: " + err.message);
            }
        });
    };

    this.initStudents = function (n) {
        mainDatabase.transaction(function (tx) {
            tx.executeSql('CREATE TABLE students (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,name NVARCHAR(255),email NVARCHAR(255))', [], function (tx) {
                tx.executeSql('INSERT INTO students (name, email) VALUES ("Dhruv", "dhruv@gmail.com")');
                tx.executeSql('INSERT INTO students (name, email) VALUES ("Krish", "krish@hotmail.com")');
                tx.executeSql('INSERT INTO students (name, email) VALUES ("Kriti", "kriti@hotmail.in")');
                tx.executeSql('INSERT INTO students (name, email) VALUES ("Sinu", "sinu@rediff.com")');
                tx.executeSql('INSERT INTO students (name, email) VALUES ("Naidu", "naidu@support.in")', [], function (tx) {
                    var sql = document.getElementById("editor").value;
                    if (n === 0) {
                        dbObj.executeSQL(sql);
                    } else {
                        document.getElementById("result_container").innerHTML = "<h5>Database has been restored.</h5>";
                    }
                    dbObj.myDatabase();
                });
            });
        }, function (err) {
            if (err.message.indexOf("students already exists") === -1) {
                window.alert("Error 10: " + err.message);
            }
        });
    }

    //    ---------

    this.runSQL = function (n) {
        mainDatabase.transaction(function (tx) {
            tx.executeSql('SELECT * FROM sqlite_sequence', [], function () {
                var sql = editor.getValue();
                dbObj.executeSQL(sql);
            });
        }, function (err) {
            dbObj.initDatabase(0);
        });
    }
}