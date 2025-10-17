"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var csv_parse_1 = require("csv-parse");
;
var csvFilePath = path.resolve(__dirname, 'files/lux.csv');
var fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
var headers = ['ticket_id', 'purchase_date', 'price', 'customer_id', 'scan_date', 'scanned_by', 'discount_id', 'source', 'referrer_id', 'discount_pct', 'event_id', 'event_start', 'event_end', 'brand_id', 'venue_id', 'city_id', 'flyer_url'];
var events = [];
(0, csv_parse_1.parse)(fileContent, {
    delimiter: ',',
    columns: headers,
}, function (error, result) {
    if (error) {
        console.error(error);
    }
    result.shift();
    console.log(result[0]);
    result.forEach(function (item) {
        var eventFound = events.find(function (event) { return event == item.event_id; });
        if (!eventFound)
            events.push(item.event_id);
    });
    console.log(events);
    console.log(events.length);
});
//# sourceMappingURL=app.js.map