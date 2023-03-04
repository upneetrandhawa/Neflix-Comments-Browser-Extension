
console.log("Netflix Comments Content JS")

document.addEventListener("DOMContentLoaded", function(event) {
                          safari.extension.dispatchMessage("Hello World!");
                          console.log("DOMContentLoaded");
                          });

//listener for messages between scripts
window.addEventListener("message", (event) => {
                            if (event.origin !== "https://www.netflix.com")
                            return;
                            
                            console.log("CONTENT JS: message received = " + event.data)
                            
                            if(event.data == "nc-toolbar-item-clicked"){
                                //when toolbar item is clicked show the popover if a video is playing
                                if (isExtensionAlreadyLoaded()){
                                    document.getElementById("nc-button").dispatchEvent(new Event('mouseover'));
                                }
                            }
                        }, false);

//constants
const redCircleEmoji = '🔴';
const localStorageUserIdKey = 'nc-userId';

//variables
var videoId;
var videoDuration;
var videoCurrentPlayTime;
var userId;
var userIdIsSet = false;
var windowURL = "";
var popButtonShowTimeout;
var extensionUpdateInterval = setInterval(function(){launchExtensionLoader()},500);
var toolbarItemClicked = false;
var commentBeingPushed = false;
var commentBeingPushedTime = -1;
var commentsBeingLoaded = false;
var comments_json;

//functions

function launchExtensionLoader(){
    console.log("launchExtensionLoader()")

    if (commentsBeingLoaded){
      console.log("launchExtensionLoader(): already loading comments")
      return
    }
    
    if(isTargetPage()){
        console.log("launchExtensionLoader(): TARGET PAGE!");
        
        if (!isExtensionAlreadyLoaded() || isURLChangedSinceExtensionWasLastLoaded()){
            console.log("launchExtensionLoader(): loading extension!");
            commentsBeingLoaded = true;
            if(extensionUpdateInterval) clearInterval(extensionUpdateInterval);
            extensionUpdateInterval = setInterval(function(){launchExtensionLoader()},5000);
            removeExtension();
            setTimeout(function(){loadExtension()},2000);
            windowURL = window.location.href;
        }
        else{
            console.log("launchExtensionLoader(): extension loaded already");
        }
    }
    else{
        console.log("launchExtensionLoader(): NOT TARGET PAGE!");
        removeExtension();
    }
}

function loadExtension() {
    console.log("loadExtension()");
    
    grabVideoDetails();
    
    if(videoId == null){
      commentsBeingLoaded = false;
        return;
    }

    commentsBeingLoaded = true;
    
    //insert our main element
    var insertTarget = document.getElementsByClassName("netflix-sans-font-loaded")[0];
    
    if (insertTarget == null) {
        console.log("loadExtension(): not the target page");
        return;
    }
    
    var nc = document.createElement('button');
    nc.className = 'nc-popup-button touchable PlayerControls--control-element nfp-button-control default-control-button';
    nc.setAttribute('id','nc-button');
    
    insertTarget.insertBefore(nc, insertTarget.firstChild);
    
    constructPopupStructure();
    
    loadUserId();
    
    loadComments();
    
    //show and hide extension button with video Controls
    document.getElementsByClassName('watch-video')[0].onmousemove = function(){
        //console.log('loadExtension(): on mouse move showing extension')
        
        nc.style.visibility = 'visible';
        
        if (popButtonShowTimeout) clearTimeout(popButtonShowTimeout);
        popButtonShowTimeout = setTimeout(function(){
                                          console.log('loadExtension(): hiding extension')
                                          nc.style.visibility = 'hidden';
                                          }, 2700);
    }
    //show popover when mouseover
    nc.addEventListener("mouseover",function(){
                        //console.log("nc button mousover");
                        document.getElementById("nc-popover").classList.add("show")
                        if (popButtonShowTimeout) clearTimeout(popButtonShowTimeout);
                        });
    
    //hide popover when mouseleave
    document.getElementById("nc-popover").addEventListener("mouseleave",function(){
                                                          //console.log("nc popover mouseleave");
                                                          document.getElementById("nc-popover").classList.remove("show");
                                                          });
    
}
function constructPopupStructure(){
    console.log("constructPopupStructure()");
    
    var nc = document.getElementById("nc-button");
    nc.innerHTML = `
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="40" height="40" preserveAspectRatio="xMidYMid meet" viewBox="0 0 96.000000 96.000000">

        <g transform="translate(0.000000,96.000000) scale(0.100000,-0.100000)" fill="#FFFFFF" stroke="#FFFFFF">
            <path d="M300 680 l0 -130 -75 0 c-43 0 -75 -4 -75 -10 0 -6 32 -10 75 -10 43
            0 75 -4 75 -10 0 -6 -32 -10 -75 -10 -43 0 -75 -4 -75 -10 0 -6 32 -10 75 -10
            l75 0 0 -40 0 -40 -75 0 c-43 0 -75 -4 -75 -10 0 -6 32 -10 75 -10 43 0 75 -4
            75 -10 0 -6 -32 -10 -75 -10 -43 0 -75 -4 -75 -10 0 -6 32 -10 75 -10 43 0 75
            -4 75 -10 0 -6 55 -10 145 -10 l146 0 92 -74 92 -75 3 75 3 74 59 0 60 0 0
            240 0 240 -300 0 -300 0 0 -130z m540 -110 l0 -180 -60 0 -60 0 0 -40 c0 -22
            -3 -40 -6 -40 -3 0 -28 18 -54 40 l-48 40 -126 0 -126 0 0 180 0 180 240 0
            240 0 0 -180z"></path>
            <path d="M380 700 c0 -5 23 -10 50 -10 28 0 50 5 50 10 0 6 -22 10 -50 10 -27
            0 -50 -4 -50 -10z"></path>
            <path d="M380 660 c0 -6 75 -10 205 -10 130 0 205 4 205 10 0 6 -75 10 -205
            10 -130 0 -205 -4 -205 -10z"></path>
            <path d="M380 620 c0 -6 42 -10 105 -10 63 0 105 4 105 10 0 6 -42 10 -105 10
            -63 0 -105 -4 -105 -10z"></path>
            <path d="M380 560 c0 -5 23 -10 50 -10 28 0 50 5 50 10 0 6 -22 10 -50 10 -27
            0 -50 -4 -50 -10z"></path>
            <path d="M380 520 c0 -6 75 -10 205 -10 130 0 205 4 205 10 0 6 -75 10 -205
            10 -130 0 -205 -4 -205 -10z"></path>
            <path d="M380 480 c0 -6 75 -10 205 -10 130 0 205 4 205 10 0 6 -75 10 -205
            10 -130 0 -205 -4 -205 -10z"></path>
            <path d="M380 440 c0 -6 57 -10 150 -10 93 0 150 4 150 10 0 6 -57 10 -150 10
            -93 0 -150 -4 -150 -10z"></path>
            <path d="M60 450 l0 -240 60 0 59 0 3 -74 3 -75 92 75 92 74 138 0 138 1 -35
            29 c-34 29 -36 30 -147 30 l-114 0 -52 -41 -52 -42 -3 42 -3 41 -60 0 -59 0 0
            180 0 180 60 0 60 0 0 30 0 30 -90 0 -90 0 0 -240z"></path>
            <path d="M150 580 c0 -5 23 -10 50 -10 28 0 50 5 50 10 0 6 -22 10 -50 10 -27
            0 -50 -4 -50 -10z"></path>
            <path d="M150 440 c0 -5 23 -10 50 -10 28 0 50 5 50 10 0 6 -22 10 -50 10 -27
            0 -50 -4 -50 -10z"></path>
            <path d="M150 320 c0 -6 28 -10 65 -10 37 0 65 4 65 10 0 6 -28 10 -65 10 -37
            0 -65 -4 -65 -10z"></path>
        </g>
    </svg>
    <div class ="nc-popover touchable popup-content-wrapper" id="nc-popover">
        <div class="nc-popup-header-container" id="nc-popup-header-container">
            <div class="nc-popup-header" id="nc-popup-header">
                <div class="nc-popup-header-title" id="nc-popup-header-title">Comments</div>
                <div class="nc-popup-header-userId-container" id="nc-popup-header-userId-container">
                    <input class ="nc-popup-header-userId-input" id="nc-popup-header-userId-input" minlength="6" maxlength="16" placeholder="choose a username...">
                    <button class="nc-popup-header-userId-button" id = "nc-popup-header-userId-button">Submit</button>
                </div>
            </div>
        </div>
        <div class="nc-popup-content-container" id="nc-popup-content-container">
            <div class="nc-popup-content" id="nc-popup-content"></div>
        </div>
        <div class="nc-popup-footer-container" id="nc-popup-footer-container">
            <div class="nc-popup-footer" id="nc-popup-footer">
                <textarea class ="nc-popup-post-textarea" id="nc-popup-post-textarea" maxlength="150" placeholder="Add a comment..." ></textarea>
                <button class="nc-popup-post-button" id = "nc-popup-post-button">Post</button>
            </div>
        </div>
    </div>
    `;
    
    document.getElementById("nc-popup-post-button").addEventListener("click",ncCommentPostButtonClicked);
    
    document.getElementById("nc-popup-header-userId-button").addEventListener("click",ncUserIdSubmitButtonClicked);
    
    document.getElementById("nc-popup-header-userId-input").addEventListener("click",function (){
                                                                             console.log("user id input clicked");
                                                                             document.getElementById("nc-popup-header-userId-input").focus();
                                                                             });
    
    document.getElementById("nc-popup-post-textarea").addEventListener("click",function (){
                                                                       console.log("comment ta clicked");
                                                                       document.getElementById("nc-popup-post-textarea").focus();
                                                                       });
}

function loadUserId(){
    console.log("loadUserId()");
    
    //check local storage
    if(getUserIdFromLocalStorage() != null){
        console.log("loadUserId(): found userId in local storage");
        userIdAvailableUpdateView(getUserIdFromLocalStorage());
    }
    else{
        console.log("loadUserId(): no userId in local storage");
    }
}

function loadComments(){
    console.log("loadComments()");
    
    //initiate a fetch call
    fetch("https://a96ewd1pph.execute-api.us-east-2.amazonaws.com/api/comments?videoId="+videoId, {
          "method": "GET"
          })
    .then(response => {
          if (!response.ok) {
          return response;
          }
          return response.json();
          })
    .then(data => {
          console.log("loadComments(): data = "+ data.body);
          
          comments_json = JSON.parse(data.body);

          grabVideoDetails();

          if(comments_json.length>0){
            if(comments_json[0].videoId == videoId){
              console.log("loadComments(): videoId has not changed");
              comments_json.sort(function (a, b) {return a.playtime - b.playtime;});

              updateCommentsOnTheView(comments_json);
            }
            else{
              console.log("loadComments(): videoId has changed");
              loadComments()
            }
          }
          
          
          
          })
    .catch(err => {
           console.log(err);
           });
}

function updateCommentsOnTheView(comments){
    console.log("updateCommentsOnTheView()");
    
    var ncCommentsContainer = document.getElementById("nc-popup-content");
    ncCommentsContainer.innerHTML = '';
    
    var indexForCommentNotOnTheView = -1;
    
    comments.forEach(
        (comment, index) => {

        if(commentBeingPushed && commentBeingPushedTime!=-1 && commentBeingPushedTime==comment.timestamp){
            indexForCommentNotOnTheView = index;
            commentBeingPushed = false;
            commentBeingPushedTime = -1;
        }
        let playtime = convertSecondsToHMS(comment.playtime);
        console.log("updateCommentsOnTheView(): playtime = " + playtime);

        var commentsTag = document.createElement('div');
        commentsTag.className = 'nc-popup-comment';

        let anchor_playtime_elem_id = "nc-popup-comment-playtime-link-" + index;

        commentsTag.innerHTML = `
        <div class = "nc-popup-comment-userId">@${comment.userId}</div>
        <div class="nc-popup-comment-content">
            <p>
                <a id=${anchor_playtime_elem_id} style="color:#E50914;" >${playtime}</a>
                ${comment.comment}
            </p>
        </div>
        `;

        ncCommentsContainer.append(commentsTag);

        var anchor_element = document.getElementById(anchor_playtime_elem_id);

        anchor_element.addEventListener("click",
                                     function(secs){
                                     return function(){playVideoAtACertainTime(secs)};
                                     }(comment.playtime),
                                     false);
        });
    
    if (indexForCommentNotOnTheView != -1){
        scrollToComment(indexForCommentNotOnTheView);
    }

    commentsBeingLoaded = false;
}

function ncCommentPostButtonClicked(){
    console.log("ncCommentPostButtonClicked()");
    
    if(!userIdIsSet){
        performShakeOnElement('nc-popup-header-userId-input');
        return;
    }
    
    var comment = document.getElementById("nc-popup-post-textarea").value;
    
    if(comment == null){
        performShakeOnElement("nc-popup-post-textarea");
        return;
    }
    comment = comment.trim();
    
    if(comment == '' || comment.length < 1){
        performShakeOnElement("nc-popup-post-textarea");
        return;
    }
    
    document.getElementById("nc-popup-post-textarea").value = "";
    
    push_comment(comment);
}

function push_comment(comment){
    console.log("push_comment()");
    
    grabVideoDetails();
    
    var d = new Date();
    var currentTimeStamp = d.getTime();
    
    commentBeingPushed = true;
    commentBeingPushedTime = currentTimeStamp;
    
    let request_data = {
    userId: userId,
    videoId: videoId,
    playtime: videoCurrentPlayTime,
    comment: comment,
    timestamp: currentTimeStamp
    };
    
    fetch('https://a96ewd1pph.execute-api.us-east-2.amazonaws.com/api/addcomment', {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(request_data),
          })
    .then(response => {
          if (response.ok) {
          console.log("push_comment(): add comment SUCCESS");
          
          loadComments();
          }
          return response.json();
          })
    .catch((error) => {
           console.error('push_comment(): Error:', error);
           });
}

function ncUserIdSubmitButtonClicked(){
    console.log("ncUserIdSubmitButtonClicked()");
    
    //check if there is value in input field
    var val = document.getElementById("nc-popup-header-userId-input").value;
    
    if(val == null){
        performShakeOnElement("nc-popup-header-userId-input");
        return;
    }
    
    val = val.trim();
    
    if(val == '' || val.length < 6){
        performShakeOnElement("nc-popup-header-userId-input");
    }
    else {
        //check if userId is available
        checkIfUserIdExists(val);
    }
}

function checkIfUserIdExists(_userId){
    
    console.log("checkIfUserIdExists(): userId = " + _userId);
    
    fetch('https://a96ewd1pph.execute-api.us-east-2.amazonaws.com/api/users?userId='+_userId, {
          "method": "GET"
          })
    .then(response => {
          if (!response.ok) {
          return response;
          }
          return response.json();
          })
    .then(data => {
          let userIdExist = JSON.parse(data.body).exist;
          
          console.log("checkIfUserIdExists(): userId = " + _userId + ": exists = " + userIdExist);
          
          if(!userIdExist){
          //push to local storage
          addUserIdToLocalStorage(_userId);
          
          //update view
          userIdAvailableUpdateView(_userId);
          
          }
          else{
          //update view
          userIdNotAvailableUpdateView(_userId);
          }
          })
    .catch(err => {
           console.log(err);
           });
}

function userIdAvailableUpdateView(_userId){
    console.log("userIdAvailableUpdateView() _userId = "+_userId);
    
    //if found
    userId = _userId;
    userIdIsSet = true;
    
    //update popup
    document.getElementById("nc-popup-header-userId-container").innerHTML = `
    <div class="nc-popup-header-userId-title" id="nc-popup-header-userId-title">commenting as @${userId}</div>
    `;
    
    //update styles
    document.getElementById("nc-popup-header-container").style.height = "14%";
    document.getElementById("nc-popup-header-title").style.height = "40%";
    document.getElementById("nc-popup-header-userId-container").style.height = "60%";
    document.getElementById("nc-popup-header-userId-container").style.alignItems = "unset";
    document.getElementById("nc-popup-content-container").style.height = "76%";
}

function userIdNotAvailableUpdateView(_userId){
    console.log("userIdNotAvailableUpdateView() _userId = " + _userId);
    
    //if not found
    userId = null;
    userIdIsSet = false;
    
    //update popup
    
    //update userId input
    document.getElementById("nc-popup-header-userId-input").value = '';
    document.getElementById("nc-popup-header-userId-input").placeholder = 'username @' + _userId + ' not available';
    
    //disable userId input
    document.getElementById("nc-popup-header-userId-input").disabled = false;
    
    //hide submit userId button
    document.getElementById("nc-popup-header-userId-button").style.display = "block";
    
    performShakeOnElement("nc-popup-header-userId-input");
}

function getUserIdFromLocalStorage(){
    console.log("getUserIdFromLocalStorage()");
    
    return window.localStorage.getItem(localStorageUserIdKey)
}

function addUserIdToLocalStorage(userId){
    console.log("addUserIdToLocalStorage(): userId = " + userId);
    
    window.localStorage.setItem(localStorageUserIdKey, userId)
}

function isTargetPage(){
    console.log("isTargetPage()")
    
    if(document.getElementsByClassName("netflix-sans-font-loaded")[0] == null || (document.getElementsByClassName("billboard") != null && document.getElementsByClassName("billboard").length != 0)){
        return false;
    }
    return true;
}

function removeExtension(){
    console.log("removeExtension()");
    document.querySelectorAll('#nc-button').forEach(e => e.remove());
}

function isExtensionAlreadyLoaded(){
    console.log("isExtensionAlreadyLoaded()");
    return document.getElementById('nc-button') != null;
}

function isURLChangedSinceExtensionWasLastLoaded(){
    console.log("isURLChangedSinceExtensionWasLastLoaded(): curr url = " + window.location.href);
    console.log("isURLChangedSinceExtensionWasLastLoaded(): stored url = " + windowURL);
    
    if (windowURL == null || windowURL == "" || windowURL == window.location.href){
        console.log("isURLChangedSinceExtensionWasLastLoaded(): false");
        return false;
    }
    console.log("isURLChangedSinceExtensionWasLastLoaded(): true");
    return true;
}

function grabVideoDetails(){
    console.log("grabVideoDetails()")
    
    if(document.getElementsByTagName("video")==null || document.getElementsByTagName("video")[0]==null){
        return;
        
    }
    videoId = document.getElementsByTagName("video")[0].parentNode.id;
    
    videoDuration = Math.floor(document.getElementsByTagName("video")[0].duration);
    
    videoCurrentPlayTime = Math.floor(document.getElementsByTagName("video")[0].currentTime);
    
    console.log(`grabVideoDetails(): video Id = ${videoId}`);
    console.log(`grabVideoDetails(): video current playtime = ${videoCurrentPlayTime}`);
}

function performShakeOnElement(element_id){
    console.log("performShakeOnElement(): element id = " + element_id);
    
    var elementClassList = document.getElementById(element_id).classList
    
    elementClassList.add('errorShake');
    
    setTimeout(function(){elementClassList.remove('errorShake')}, 1000);
}

function quick_highlight_comment(element){
    console.log("quick_highlight_comment()");
    
    element.classList.add('new_comment_quick_highlight');
    
    document.getElementById(element_id).classList.remove('new_comment_quick_highlight');
    
    setTimeout(function(){element.classList.remove('new_comment_quick_highlight')}, 3000);
}


function scrollToComment(index){
    console.log("scrollToComment(): index = " + index);
    
    var element = document.getElementsByClassName('nc-popup-comment')[index];
    element.scrollIntoView({ behavior: 'smooth'});
    
    quick_highlight_comment(element);
}

function playVideoAtACertainTime(seconds){
    console.log("playVideoAtACertainTime()");
    
    const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
    
    videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]).seek(seconds*1000)
}

function convertSecondsToHMS(sec) {
    console.log("convertSecondsToHMS(): sec = " + sec);
    
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    // add 0 if value < 10
    hours = hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    minutes = minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    seconds = seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    //if video duration is atleast an hour, then include hours
    if(videoDuration >= 3600){
        return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
    }
    return minutes+':'+seconds;
}
