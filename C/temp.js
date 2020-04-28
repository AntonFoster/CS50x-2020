/**
 * Gym Members gaining access Activity
 */

/**
 * Designed By Kevin Strudwick
 * Developed By Anton Foster
 * Last Change:
 * Anton: [27 April 2020] Changed the storage of the checkin / out times
 *        Added function to display in local timezone (Computer timezone)
 *        Add fuction to Save the check in and check out times to the entity metadata
 *        A few bug fixes completed
 *        
 */

(function(w) {

    /* Settings and data repository */
    var settings = {
        members_url: "/entity/entitybytype/5d611d8fb9132363b05561df",
        members_opt: { fields: ['title', 'metadata'], sort: { 'title': "asc" } },
        member_list: [], // List of members
        member_lines: [], // Members added to the container
        member_unbarred: '010', // Disable members that do not have this status 
        ready: false, // System Ready
        metadata: {}, // Activity Metadata
        current_member: null, // Current member selected prior to adding to table
        activity_date: null,
        entity_checkin: 'check_details_in',
        entity_checkout: 'check_details_out',
        active: false               // Is this an active entity or is it in the data model designer
    };

    var Udls = {
        'status': { 'key': '5d5fca1ab9132363b05561db', "list": {} },
        'scheme': { 'key': '5d5fc84eb913237b360cc53a', "list": {} },
        'contac': { 'key': '5d61147db913237b360cc53d', "list": {} }
    };

    /**
     * Define the exportable object
     */
    var memberlist = {
        /*
        * Show settings for Debug
        */ 
        getSettings: function() {
            return settings;
        },
        /** 
        * Delete a row from the container
        * @param {Object} o - Dom Object
        */
        delete: function(o) {
            line = parseInt(o.getAttribute('data-key'));

            var clines = w.copyJson(settings.member_lines);
            settings.member_lines = [];
            var lineno = 1,
                pl = 0,
                lc = clines.length;
            clines.forEach(function(l) {
                if (parseInt(l.line) !== line) {
                    l.line = lineno;
                    settings.member_lines.push(l);
                    lineno++;
                }
                pl++;
                if (pl >= lc) {
                    PopulateMembersTable();
                }
            });
        },
        /** 
        * Set the time member left the gym
        * @param {Object} o - Dom Object
        */
        out: function(o) {
            key = parseInt(o.getAttribute('data-key'));
            for (var i = 0; i < settings.member_lines.length; i++) {
                if (parseInt(settings.member_lines[i].line) === key) {
                    settings.member_lines[i].time_out = moment().local().format("YYYY-MM-DD HH:mm");
                    var payload = { 'fieldset': {'check_details_out' : settings.member_lines[i].time_out}  };
                    updateEntity( settings.member_lines[i].id, payload );
                }
            }
            PopulateMembersTable();
        }
    };

    /* Export the member to the window */
    window.memberlist = memberlist;

    /**
     * Init the member component
     */
    function init() {
        var opt = { fields: ['title', 'metadata'] };
        w.GetData(settings.members_url, settings.members_opt).then(function(sd) {
            settings.member_list = sd;
            return SetupMemberData();
        }).then(function() {
            $("#member_selector").trigger("change");
            return getUdlLists();
        }).then(function() {
            return ClearMemberForm();
        }).then(function() {
            FetchMetadata();
            bind(function(){
                settings.ready = true;
            });
        }).catch(function(err) {
            log.e("Error init Datamodel JS ", err);
        });
    }

    /**
     * Setup any bindings required
     * @param {fn} cb - Callback 
     */
    function bind(cb) {

        $("#member_add").on('click', function() {
            addMemberToList();
            ClearMemberForm();
        });

        $("#member_cancel").on('click', function() {
            ClearMemberForm();
        });

        $("#member_selector").select2({
            placeholder: "Select a Member",
            multiple: false,
            theme: 'classic',
            width: '100%',
            allowClear: true,
            trigger: 'change',
        }).on('change', function() {
            populateInfo($(this).val());
        });

        if (typeof cb !== 'undefined' && cb !== null && typeof cb === 'function'){
            cb();
        }
    }

    /**
     * Get all the UDL's needed
     */
    function getUdlLists() {
        return new Promise(function(resolve, reject) {
            try {
                var ukeys = Object.keys(Udls),
                    ud = 0;
                var ul = ukeys.length;
                ukeys.forEach(function(keyname) {
                    var url = "/iapi/fetchone/udlists/" + Udls[keyname].key;
                    w.GetData(url, {}).then(function(u) {
                        Udls[keyname].list = u.list;

                    }).catch(function(err) {
                        reject(err.statusText);
                    });
                    ud++;
                    if (ud >= ul) {
                        resolve();
                    }
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Configure the Select2 selector for the form
     */
    function SetupMemberData() {
        return new Promise(function(resolve, reject) {
            try {
                var sel = $("#member_selector").empty().trigger("change");

                if (settings.member_list.length === 0) {
                    resolve();
                }
                sel.append("<option value=''>No Selection</option>");

                var sil = settings.member_list.length,
                    shd = 0;

                settings.member_list.forEach(function(si) {
                    var disabled = (si.metadata.status !== settings.member_unbarred) ? '(*)' : '';
                    sel.append("<option value='" + si._id + " '>" + si.title + " " + disabled + "</option>");
                    shd++;

                    if (shd >= sil) {
                        resolve();
                    }
                });
            } catch (e) {
                console.error("SetupMemberData failed ", e);
                reject();
            }
        });
    }

    /**
     * check if the member is already allocated
     * you can not allocate twice.
     * @param {string} id - members ID
     */
    function checkallocated(id) {
        var m = w.findById(settings.member_lines, id, "id");
        return (m === null) ? false : true;
    }

    /**
     * Clear the line form
     */
    function ClearMemberForm() {
        settings.current_line = {
            "line": 0,
            "member": "",
            "status": "",
            "scheme": "",
            "renewal": 0,
            'mandate': "",
            'recurring': ""
        };
        $('#member_selector').val("");
        $('#member_status').val("");
        $('#member_scheme').val("");
        $('#member_annual_expire').val("");
        $('#member_dd_status').val("");
        $('#member_badinv').val("");
        $("#metadata-member_notes").val("");
        $("#metadata-address").val("");
        $("#metadata-phone_number").val("");
        $("#metadata-mobile_number").val("");
        $("#metadata-emergency_number").val("");
        $("#metadata-emergency_contact").val("");
        $("#metadata-email_of_client").val("");
        $("#metadata-balance").val(0);
        $("#metadata-balance_date").val("");

    }

    /**
     * Adds the line to the list of attendees
     */
    function addMemberToList() {
        if (settings.current_member) {
            var member_record = {
                'id': settings.current_member._id,
                'name': settings.current_member.title,
                'time': w.moment().local().format("YYYY-MM-DD HH:mm"),
                'time_out': "",
                'scheme': Udls.scheme.list[settings.current_member.metadata.scheme],
                'renewal': settings.current_member.metadata.annual_expire,
                'mandate': settings.current_member.metadata.dd_status,
                'recinv': settings.current_member.metadata.badinv,
            };
            settings.member_lines.push(member_record);
            var payload = { 'fieldset': {'check_details_in' : member_record.time}  };
            updateEntity( settings.current_member._id, payload );
            PopulateMembersTable();
        }
    }

    /**
     * Populates the form next to the select member dropdown and any other 
     * Info in the space below as required 
     * @param {String} member_id - MongoDb ID of the member
     */
    function populateInfo(member_id) {
        ClearMemberForm();
        if (!checkallocated(member_id)) { // Exclude members already allocated

            settings.current_member = w.findById(settings.member_list, member_id, "_id");

            if (settings.current_member) {
                var allowed = (settings.current_member.metadata.status === settings.member_unbarred) || false;
                if (allowed) {
                    $("#member_add").removeClass('hide');
                } else {
                    $("#member_add").addClass('hide');
                }
                $("#member_scheme").val(Udls.scheme.list[settings.current_member.metadata.scheme]);
                $("#member_annual_expire").val(settings.current_member.metadata.annual_expire);
                $("#member_dd_status").val(settings.current_member.metadata.dd_status);
                $("#member_badinv").val(settings.current_member.metadata.badinv);
                $("#metadata-member_notes").val(settings.current_member.metadata.member_notes);
                $("#metadata-address").val(settings.current_member.metadata.address);
                $("#metadata-phone_number").val(settings.current_member.metadata.phone_number);
                $("#metadata-mobile_number").val(settings.current_member.metadata.mobile_number);
                $("#metadata-emergency_number").val(settings.current_member.metadata.emergency_number);
                $("#metadata-emergency_contact").val(Udls.contac.list[settings.current_member.metadata.emergency_contact]);
                $("#metadata-email_of_client").val(settings.current_member.metadata.email_of_client);
                $("#metadata-balance").val(settings.current_member.metadata.balance);
                $("#metadata-balance_date").val(settings.current_member.metadata.balance_date);
            }
        } else {
            $("#member_selector").notify("Warning: Can not add member - they are already allocated", {
                className: "warn",
                position: "right bottom",
                showAnimation: 'slideDown',
                // show animation duration
                showDuration: 400,
                // hide animation
                hideAnimation: 'slideUp',
            });
            $("#member_add").addClass('hide');
        }
    }

    /**
     * Populates the Members list table
     */
    function PopulateMembersTable() {
        var inv = $("#member_list").empty(),
            linecnt = 1;
        settings.member_lines.forEach(function(line) {
            if (!line.hasOwnProperty('line')) {
                line.line = linecnt;
            }
            var to = convertTimeToLocal(line.time_out);     // Convert time out
            var ti = convertTimeToLocal(line.time);         // Convert time in
            var tr = "<tr>";
            tr += "<td style='width: 40px;'>" + line.line.toString() + "</td>";
            tr += "<td>" + line.name + "</td>";
            tr += "<td>" + ti + "</td>";
            tr += "<td>" + to + "</td>";
            tr += "<td style='text-align: left; width: 250px;'>" + line.scheme + "</td>";
            tr += "<td>" + line.renewal + "</td>";
            tr += "<td style='text-align: left;'>" + line.mandate + "</td>";
            tr += "<td style='text-align: left;'>" + line.recinv + "</td>";
            tr += "<td  style='text-align: center; width: 150px;'>";
            if (settings.editable && checkMetadata()) {
                if (w.isEmpty(to)) {
                    tr += "<button data-key='" + line.line + "' onclick='memberlist.out(this)' title='Book member out of the gym'  type='button' class='button success small obj-margin-right'><span class='fa fa-sign-out'></span></button> ";
                }
                tr += "<button data-key='" + line.line + "' onclick='memberlist.delete(this)' title='Delete member from the list' type='button' class='button alert small'><span class='fa fa-trash'></span></button>";
            } else {
                tr += "Locked";
            }
            tr += "</td>";
            tr += "</tr>";
            linecnt++;
            inv.append(tr);
        });
        PopulateMetadata();
    }

    /**
     * Takes the Date Time String and converts it to a 
     * Timestamp in local time
     * @param {String} vtime - "YYYY-DD-MM HH:mm" 
     * @returns {String} - "HH:mm" or " "
     */
    function convertTimeToLocal(vtime) {
        if (w.isEmpty(vtime)) {
            return " ";
        } else {
            // Africa/Johannesburg
            // var temp = moment(vtime+":00+00:00"); // cast the timestamp as UTC
            var temp = moment(vtime);
            // console.log("Temp Time ", temp.format("YYYY MMM DD HH:mm"), temp.local().format("YYYY MMM DD HH:mm") ,temp.utcOffset("Africa/Johannesburg").format("YYYY MMM DD HH:mm") );
            // return (temp.isValid()) ? temp.local().format("HH:mm") : " ";
            return (temp.isValid()) ? temp.format("HH:mm") : " ";
        }
    }

    /**
     * Adds all the hidden inputs to the DOM to be saved with the form
     */
    function PopulateMetadata() {
        var cont = $("#member_input_dom_items").empty(),
            lineno = 0;
        settings.member_lines.forEach(function(line) {
            var ln = lineno.toString();
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][line]' value='" + line.line + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][id]' value='" + line.id + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][name]' value='" + line.name + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][time]' value='" + line.time + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][time_out]' value='" + line.time_out + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][scheme]' value='" + line.scheme + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][renewal]' value='" + line.renewal + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][mandate]' value='" + line.mandate + "' >");
            cont.append("<input type='hidden' class='ri' name='metadata[members][" + ln + "][recinv]' value='" + line.recinv + "' >");
            lineno++;
        });
        DataChanged();
    }

    /**
     * If this is an active Activity (Not the data model editor)
     * Then get the current Metadata
     */
    function FetchMetadata() {
        if (typeof redit === 'object') {
            settings.hostobject = redit;
            settings.metadata = redit.getActivity_data('metadata');
            var status = redit.getActivity_data('status');
            settings.actid = redit.getActivity_data('_id');
            settings.activity_date = redit.getActivity_data('activity_date');
            settings.editable = (status.id === "ip");
            settings.active = true;
            LoadMetadata();
        } else {
            // Used for testing
            settings.active = false;
            settings.activity_date = moment().utc().format();
        }
    }

    /**
     * checks if the activity date is the same as today
     */
    function checkMetadata() {
        var today = moment().utc().format("YYYY-MM-DD");
        var actdate = moment(settings.activity_date).format("YYYY-MM-DD");
        return (moment(today).isSame(actdate));
    }

    /**
     * Load the values from the metadata into the Data model
     */
    function LoadMetadata() {
        if (settings.metadata.hasOwnProperty('members')) {
            settings.member_lines = settings.metadata.members;
            PopulateMembersTable();
        }
    }

    /**
     * Trigger data changed (click the checkbox)
     */
    function DataChanged() {
        if (settings.ready) $("#datachange").click();
    }

    /**
     * Function to update the metadata in the entity / activity
     * @param {String} id - ID of the entity to update
     * @param {Object} payload - What fields must we update in the metadata 
     * format -> {'fieldset': {filed1: value1, field2: value2}} 
     */
    function updateEntity(id, payload) {
        payload._token = w.getCSRF();
        if ( !w.isEmpty(id) && settings.active ) {
            url = "/iapi/metadata/entities.entity/" + id;
            w.PostJSONData(url, payload).then(function(r) {
                log.i("Save result : ", r);
            }).catch(function(err) {
                log.e("Error saving entity ", err);
            });
        }
    }

    /**
     * DOM is ready so start the Admissions
     */
    $(document).ready(function() {
        init();
    });
})(window);