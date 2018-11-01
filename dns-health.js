'use strict';

d3.select("#main").text("Calculating..");

var statuses={}
var allsections={};
var allrfcs={};
var dnsrfcentries={};

function tabulate(data, columns) {
    d3.select('#table').html("");
    var table = d3.select('#table').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
	.selectAll('th')
	.data(columns).enter()
	.append('th')
	.text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
	.data(data)
	.enter()
	.append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
	.data(function (row) {
	    return columns.map(function (column) {
		return {column: column, value: row[column], url: row["url"]};
	    });
	})
	.enter()
	.append('td')
	.html(function (d) {
            if(d.column != "title")
                return d.value;
            else
                return '<a href="'+d.url+'">'+d.value+'</a>';
        });

    return table;
}


function handleStatusClick(e)
{
    statuses[e.id]=e.checked;
    updateTable();
}

function handleSectionClick(e)
{
    allsections[e.id]=e.checked;
    updateTable();
}


function createTable()
{
    var statarr = Object.keys(statuses);

    var table = d3.select('#selector').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    
    tbody.append('tr')
	.selectAll('td')
	.data(statarr).enter()
	.append('td')
	.html(function (column) {
            if(statuses[column])
                return '<input type="checkbox" checked id="'+column+'" onclick="handleStatusClick(this);">  <label for="'+column+'">'+column+'</label>';
            else
                return '<input type="checkbox" id="'+column+'" onclick="handleStatusClick(this);">  <label for="'+column+'">'+column+'</label>';
        });

    var sectarr = Object.keys(allsections);
    tbody.append('tr')
	.selectAll('td')
	.data(sectarr).enter()
	.append('td')
	.html(function (column) {
            if(allsections[column])
                return '<input type="checkbox" checked id="'+column+'" onclick="handleSectionClick(this);">  <label for="'+column+'">'+column+'</label>';
            else
                return '<input type="checkbox" id="'+column+'" onclick="handleSectionClick(this);">  <label for="'+column+'">'+column+'</label>';
        });

}

function updateTable()
{
    var arr=[]
    for(var e in dnsrfcentries) {
        var o = dnsrfcentries[e];

        if(statuses["No Error"] && o.rcode==0 && o.answer.length > 0)
            arr.push(o);
        else if(statuses["No Data"] && o.rcode==0 && o.answer.length==0)
            arr.push(o);
        else if(statuses["SERVFAIL"] && o.rcode==2)
            arr.push(o);
        else if(statuses["NXDOMAIN"] && o.rcode==3)
            arr.push(o);
        else if(statuses["Many queries"] && o.numqueries > 20)
            arr.push(o);
        else if(statuses["Timeouts"] && o.numtimeouts > 1)
            arr.push(o);
        else if(statuses["EDNS Fallback"] && o.numformerrs > 0)
            arr.push(o);
        
        
    }
    
    tabulate(arr, ["name", "numqueries", "numtimeouts", "numformerrs", "rcode", "content"]); 
    
    d3.select("#main").text("There are "+Object.keys(dnsrfcentries).length + " domains, of which "+arr.length+" match criteria");
}

var results={};

d3.json("result.json", {cache: "force-cache"}).then(function(js) {
    results = js;
    for(var a in js) {
        var dom = js[a];
        dom.content = "";
        for(var b in dom.answer) {
            dom.content = dom.content + dom.answer[b].content+ " ";
        }
        dnsrfcentries[dom.name] = dom;
    }
    statuses["No Error"]=0;
    statuses["No Data"]=0;
    statuses["NXDOMAIN"]=1;
    statuses["SERVFAIL"]=1;
    statuses["Many queries"]=1;
    statuses["Timeouts"]=1;
    statuses["EDNS Fallback"]=1;
    createTable();
    updateTable();
});




