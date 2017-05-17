const pg = require('pg');
const fs = require('fs');
const Mark = require("markup-js");
const React = require("react");
const SqlDoc = require("sqldoc");
const _ = require('lodash');

var api = {};

var InternalError = function (err, response){
            console.log(err);
            response.status(500).send({
                status: 'error',
                message: 'Internal Error',
            });
}

var RunQuery = function(response, query, params, callback){

    pg.connect(process.env.SQLSHARE_DB, function(err, client, done) {
        if (err) {
            return InternalError(err, response);
        }

        client.query(query, params, function(err, result){
            done();
            if (err){
                return InternalError(err, response);
            }
            callback(result);
        });

    });
}

/**
/* Input: Expects a POST request with a JSON body to be saved as a document
 * Output: JSON with OK status and a document id
 * Error: JSON with error status and message
 */
api.share = function(req, response){
    pg.connect(process.env.SQLSHARE_DB, function(err, client, done) {
        if (err) {
            return InternalError(err, response);
        }

        RunQuery(response, 'SELECT o_guid FROM sqlshare.create_doc($1)', [req.body], function(result){
            return response.status(200).send({
                status: 'OK',
                result: result.rows[0].o_guid,
            });
        });

    });
}

var _doc_template = fs.readFileSync(__dirname+'/html/document.html', {encoding: 'utf8'});
var _doclist_template = fs.readFileSync(__dirname+'/html/doclist.html', {encoding: 'utf8'});
var _404_template = fs.readFileSync(__dirname+'/html/document-404.html', {encoding: 'utf8'});

api.render = function(req, response){
    RunQuery(response, 'SELECT o_guid docid, o_doc doc, o_created created FROM sqlshare.get_doc($1)', [req.params.docid], function(result){

        if (result.rows[0].docid == null){
            var doc_html = _404_template;
        } else {
            var doc_data = result.rows[0].doc;
            var created = result.rows[0].created;
            var sqldoc = React.createElement(SqlDoc, {data: doc_data, buttonBar: false, eventKey: 0});
            var sqldoc_html = React.renderToStaticMarkup(sqldoc);
            doc = {
                doc: sqldoc_html,
                created: created,
            }
            var doc_html = Mark.up(_doc_template, doc);
        }
        
        return response.send(doc_html);
        
    });
}

api.list = function(req, response){
    //response.send('OK');
	let doclist = [];
    RunQuery(response, 'SELECT guid docid, doc FROM sqlshare.docs', null, function(result){
//		console.log(result.rows);
		_.each(result.rows,row => {
			doclist.push(row.docid);
		});
		let html = "<ul>";
		_.each(doclist,doc => {
			html += "<li><a href='/api/1.0/docs/"+doc+"' target='_blank'>"+doc+"</a>";
		});
		html += "</ul>";
        doc = {
            doclist: html,
        }
        var doc_html = Mark.up(_doclist_template, doc);
        
        return response.send(doc_html);
    });
}

module.exports = api;
