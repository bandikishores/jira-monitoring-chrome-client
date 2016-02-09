
var onClickLink;

function checkAuth(){
		var notifications = 0;

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			
			if (this.readyState == 4 ){
				if(this.status == 401){
					userloggedin = false;
					return;
				}
				if(this.status == 200) {
					var resp;
					try{
						resp = this.responseText;
						username = JSON.parse(this.responseText).name;
						userloggedin = true;
						//alert(resp);
						return;
					}catch(e){
						alert(e);
						return;
					}				
				}
			}	
		}
		xmlhttp.open("GET", url+"rest/auth/1/session?jsonp-callback=authCallback", true);
		xmlhttp.send();
		xmlhttp.timeout = metricsRequestTimeout;
		xmlhttp.ontimeout = function () { //alert("Request Timeout");
						this.obj.statusCode = 0; }			
}

function updateValues(){
	checkAuth();
	if(userloggedin){
		chrome.browserAction.setIcon({path:"icon2.png"}, null);
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {			
			if (this.readyState == 4 && this.status == 200){
				var resp;
				try{
					resp = JSON.parse(this.responseText);
					
					if (jiraissues < resp.total) {
						// alert("less");
						var totalIssuesRaised = resp.total - jiraissues;
						var messageString = totalIssuesRaised
								+ ' New On Call Issues Raised';
						var singleIssueOpened = false;

						if (totalIssuesRaised == 1) {
							for (var i = 0; i < resp.issues.length; i++) {
								var issue = resp.issues[i];
								var isNewIssue = true;
								if (jiraissuesSummary != undefined) {
									for (var i = 0; i < jiraissuesSummary.length; i++) {
										var oldIssues = jiraissuesSummary[i];
										if (oldIssues.key == issue.key) {
											isNewIssue = false;
											break;
										}
									}
								}

								if (isNewIssue) {
									messageString = issue.key;
									singleIssueOpened = true;
									
									break;
								}
							}
						}

						chrome.runtime.sendMessage({
							body : messageString,
							isSingleJIRA : singleIssueOpened,
							isRaised : true
						});
					} else if (jiraissues > resp.total) {
						// alert("more");
						var totalIssuesClosed = jiraissues - resp.total;
						var messageString = totalIssuesClosed
								+ ' On Call Issues Closed';
						var singleIssueClosed = false;

						if (totalIssuesClosed == 1) {
							for (var i = 0; i < jiraissuesSummary.length; i++) {
								var issue = jiraissuesSummary[i];
								var isOldIssue = true;

								if (resp.total != undefined) {
									for (var i = 0; i < resp.issues.length; i++) {
										var newIssues = resp.issues[i];
										if (newIssues.key == issue.key) {
											isOldIssue = false;
											break;
										}
									}
								}
								if (isOldIssue) {
									messageString = issue.key;
									singleIssueClosed = true;
									break;
								}
							}
						}

						chrome.runtime.sendMessage({
							body : messageString,
							isSingleJIRA : singleIssueClosed,
							isRaised : false
						});
					}
					  
					jiraissues = resp.total;
					jiraissuesSummary= resp.issues;
					chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});
					chrome.browserAction.setBadgeText({text:jiraissues + ""});
					//alert(resp);
					return;
				}catch(e){
					alert(e);
					return;
				}				
			}	
		}
		xmlhttp.open("GET", url+"rest/api/2/search?jql=filter="+filterId, true);
		xmlhttp.send();
		xmlhttp.timeout = metricsRequestTimeout;
		xmlhttp.ontimeout = function () { //alert("Request Timeout");
						this.obj.statusCode = 0; }		
	}else{
		chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});
		chrome.browserAction.setBadgeText({text:"0"});
		chrome.browserAction.setIcon({path:"error.jpg"}, null);
	}
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
	var isSingleJIRA = msg.isSingleJIRA;
	var message = msg.body;

	chrome.notifications.onClicked.removeListener(openTab);
	
	if(isSingleJIRA)
	{
		onClickLink = url+"browse/"+message;
		var isRaised = msg.isRaised;
		if(isRaised)
		{
			message = 'New JIRA Issue ' + msg.body + ' Raised';
		}
		else
		{
			message =  'Old JIRA Issue ' + msg.body + ' Closed'; 
		}
	}
	else
	{
		onClickLink = url+"issues/?filter="+filterId;
	}
	
	chrome.notifications.create(getNotificationId(), {
		title : 'JIRA On Call',
		iconUrl : 'notification.png',
		type : 'basic',
		message : message
	}, function(id) {
	});

	chrome.notifications.onClicked.addListener(openTab);
});

function openTab(notificationId) {
		chrome.tabs.create({
			url : onClickLink
		});
	}

function getNotificationId() {
	var id = Math.floor(Math.random() * 9007199254740992) + 1;
	return id.toString();
}

updateValues();
setInterval(updateValues, refreshInterval);
