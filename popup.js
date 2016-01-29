function printStats(){
	var innerHtml = "";
	if(!chrome.extension.getBackgroundPage().userloggedin){
		innerHtml +="Looks like you're not logged in. Make sure you log into <a href='https://jira.corp.inmobi.com' target='_blank'>https://jira.corp.inmobi.com</a>";
	}else{
		var jiraissues = chrome.extension.getBackgroundPage().jiraissues;
		var jiraissuesSummary = chrome.extension.getBackgroundPage().jiraissuesSummary;
		if(jiraissues > 0){
			innerHtml += "<table width='700px'>";
			innerHtml += "<tr><td><b>Link</b></td><td><b>Summary</b></td><td><b>Priority</b></td><td><b>Assigee</b></td></tr>";
			for(var i = 0; i < jiraissuesSummary.length; i++){
				var issue = jiraissuesSummary[i];
				innerHtml +="<tr>";
 				innerHtml += "<td><a href='https://jira.corp.inmobi.com/browse/"  + issue.key + "' target='_black'>" +issue.key+ "</a></td>";
				innerHtml += "<td>" +issue.fields.summary+ "</td>";
				innerHtml += "<td>" +issue.fields.priority.name+ "</td>";
				innerHtml += "<td>" +issue.fields.assignee.name+ "</td>";
				innerHtml +="</tr>";
			}
			innertHtml="</table>"
		}else{
			innerHtml = "0 Oncall-Issues";
		}
	}
	if(document.body==null)
		return;
	document.body.innerHTML = innerHtml;
}
printStats();
setInterval(printStats, 1000);
