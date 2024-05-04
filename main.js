var VideoName="screenshot";
var VideoId="";

function showAutoHideAlert(message, duration) {
      // Create the alert element
      const alertElement = document.createElement('div');
      alertElement.className = 'alert alert-success auto-hide-alert';
      alertElement.setAttribute('role', 'alert');
      alertElement.textContent = message;
      document.getElementById('container').appendChild(alertElement);

      // Show the alert
      alertElement.style.display = 'block';

      // Hide the alert after the specified duration
      setTimeout(function(){
          alertElement.style.display = 'none';
      }, duration);
}

function capture() {
  // Select the target div
  const target = document.getElementById('screenshotDiv');

  // Use html2canvas to capture the content of the target div
  html2canvas(target).then(canvas => {
      // Convert the canvas to a blob
      canvas.toBlob(blob => {
          // Create a new clipboard item
          const item = new ClipboardItem({ 'image/png': blob });

          // Copy the clipboard item to the clipboard
          navigator.clipboard.write([item]);

          // Inform the user that the image has been copied
          showAutoHideAlert('Image copied to clipboard!', 2000);
      });
  });
}




function download() {
  // Select the target div
  const target = document.getElementById('screenshotDiv');

  // Use html2canvas to capture the content of the target div
  html2canvas(target).then(canvas => {
      // Convert the canvas content to a data URL
      const dataURL = canvas.toDataURL();

      // Create a link element
      const link = document.createElement('a');

      // Set the href attribute to the data URL
      link.href = dataURL;

      // Set the download attribute to specify the filename
      link.download = VideoName+'.png';

      // Simulate a click on the link to trigger the download
      link.click();
  });
}


async function takeScreenshot() {

  html2canvas(document.getElementById('screenshotDiv'))
      .then((canvas)=>{
       var output= document.getElementById('output');
       output.innerHTML="";
       output.appendChild(canvas);
      })
  
  return null;

  const canvas = await html2canvas(document.getElementById('screenshotDiv'));

  // Convert canvas to Base64 data URL
  const imgData = canvas.toDataURL('image/png');

  // Copy image to clipboard
  navigator.clipboard.write([
    new ClipboardItem({ 'image/png': canvas.toBlob() })
  ]).then(() => {
    alert('Screenshot copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy screenshot: ', err);
  });
}


function convertImageUrlToDataUrl(imageUrl, callback) {
  // Create a new Image object
  var img = new Image();

  // Set the crossOrigin property to 'Anonymous' to avoid CORS issues
  img.crossOrigin = 'Anonymous';

  // Set the onload callback function
  img.onload = function() {
      // Create a canvas element
      var canvas = document.createElement('canvas');

      // Set the canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Get the drawing context
      var ctx = canvas.getContext('2d');

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Get the data URL of the canvas
      var dataUrl = canvas.toDataURL('image/png'); // Change 'image/png' to match the image format

      // Call the callback function with the data URL
      callback(dataUrl);
  };

  // Set the source of the image to the URL
  img.src = imageUrl;
}



function showVideoInfo() {
    // Get the input value
    var videoURL = document.getElementById("videoURL").value;

    // Extract video ID from URL
    var videoID = extractVideoID(videoURL);
    if (videoID ==""){
      return null;
    }

    // Write the video ID to console
    console.log("YouTube Video ID:", videoID);

    // You can use the video ID for further processing if needed
	getVideoInfo(videoID).then((data)=> {displayVideoInfo(data);});
		//getVideoInfo(videoID).then((data)=> {console.log(data);});

}

// Function to extract video ID from YouTube URL
function extractVideoID(url) {
    // Regular expression to extract video ID from YouTube URL
    var regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    // Match the URL with the regular expression
    var match = url.match(regExp);

    // If match found, return the video ID, else return null
    return match ? match[1] : null;
}


async function displayVideoInfo(videoInfo) {
  // Assuming you have elements in your HTML to display video information
  // You can update those elements with the fetched video information
  // For example, you might update <div> elements with the thumbnail, title, description, etc.
  // Make sure to adjust this function based on how you want to display the video info
  
  // Example: Assuming you have elements with IDs 'thumbnail', 'title', 'description', etc.
  var thumbImageUrl = videoInfo[0];
  var thumbImageProxy = 'https://corsproxy.io/?' + thumbImageUrl;
  convertImageUrlToDataUrl(thumbImageProxy,(dataUrl)=>{
    if (thumbImageUrl.includes("sddefault")) {
      cropImage(dataUrl).then((croppedDataUrl)=>{document.getElementById("thumb").src=croppedDataUrl})
    }  
    else{  
      document.getElementById("thumb").src=dataUrl;
    }
  });

  //document.getElementById("thumb").src = convertImageUrlToDataUrl(videoInfo[0]);
  document.getElementById("title").innerText = videoInfo[1];
  document.getElementById("channelName").innerText = videoInfo[2]+ " • "+ videoInfo[4]+" views • " +videoInfo[6] +" subs • "+videoInfo[7];
  //document.getElementById("description").innerText = videoInfo[3];
 // document.getElementById("views").innerText = videoInfo[4];
  document.getElementById("duration").innerText = videoInfo[5];
 // document.getElementById("subscribers").innerText = videoInfo[6];
  //document.getElementById("published").innerText = videoInfo[7];

  var channelIconUrlProxy = 'https://corsproxy.io/?'+videoInfo[8];
  convertImageUrlToDataUrl(channelIconUrlProxy,(dataUrl)=>{document.getElementById("channelIcon").src=dataUrl})

  //document.getElementById("channelIcon").src = ( videoInfo[8]);
  console.log("DONE")
}


// Define function to get video information
async function getVideoInfo(videoId) {
  var apiKey = 'AIzaSyAi9TmRbAeBiTxzxtUGoDiyVHOhW63GYNc'; 
  var videoUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + videoId + '&key=' + apiKey + '&part=snippet,statistics,contentDetails';

  try {
    // Fetch video data
    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();
    
    var snippet = videoData.items[0].snippet;
    
    var thumbnailUrl = snippet?.thumbnails?.maxres?.url;
    //If video does not have max res thumbnail
    if (!thumbnailUrl) {
      thumbnailUrl=snippet?.thumbnails?.standard?.url;
    }
    var title = snippet?.title; VideoName=title;
    var channelName = snippet?.channelTitle;
    var description = snippet?.description;
    var channelId = snippet?.channelId;
    var publishDate = formatDate(snippet?.publishedAt); //Format publish date
 
    

    var contentDetails = videoData.items[0].contentDetails;
    var length = formatDuration(contentDetails?.duration);


    var statistics = videoData.items[0].statistics;
    var views = formatViews(statistics.viewCount);
    // Fetch channel information including subscriber count and channel icon
    
    var channelUrl = 'https://www.googleapis.com/youtube/v3/channels?id=' + channelId + '&key=' + apiKey + '&part=snippet,statistics';

    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse?.json();

    var subscriberCount = formatViews(channelData?.items[0]?.statistics?.subscriberCount);
    var channelIcon = channelData?.items[0]?.snippet?.thumbnails?.default?.url; // Channel icon URL
    // Return array of video information
    return [thumbnailUrl, title, channelName, description, views, length, subscriberCount, publishDate, channelIcon];
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; // Handle error gracefully
  }
}


function cropImage(dataUrl) {
  // Create a new image object
  var img = new Image();

  // Set the source of the image to the data URL
  img.src = dataUrl;

  // Return a Promise that resolves with the cropped data URL
  return new Promise((resolve, reject) => {
      // Wait for the image to load
      img.onload = function() {
          // Create a canvas element
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);

          // Get image data
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var data = imageData.data;

          // Find top border height
          var topBorderHeight = 0;
          for (var y = 0; y < canvas.height; y++) {
              var isBlackLine = true;
              for (var x = 0; x < canvas.width; x++) {
                  var pixelIndex = (y * canvas.width + x) * 4; // Pixel index in the data array
                  // Check if the pixel is not black
                  if (data[pixelIndex] !== 0 || data[pixelIndex + 1] !== 0 || data[pixelIndex + 2] !== 0 || data[pixelIndex + 3] !== 255) {
                      isBlackLine = false;
                      break;
                  }
              }
              if (!isBlackLine) break;
              topBorderHeight++;
          }

          // Find bottom border height
          var bottomBorderHeight = 0;
          for (var y = canvas.height - 1; y >= 0; y--) {
              var isBlackLine = true;
              for (var x = 0; x < canvas.width; x++) {
                  var pixelIndex = (y * canvas.width + x) * 4; // Pixel index in the data array
                  // Check if the pixel is not black
                  if (data[pixelIndex] !== 0 || data[pixelIndex + 1] !== 0 || data[pixelIndex + 2] !== 0 || data[pixelIndex + 3] !== 255) {
                      isBlackLine = false;
                      break;
                  }
              }
              if (!isBlackLine) break;
              bottomBorderHeight++;
          }

          // Create a new canvas for the cropped image
          var croppedCanvas = document.createElement('canvas');
          var croppedCtx = croppedCanvas.getContext('2d');
          // Set dimensions for the cropped canvas
          croppedCanvas.width = canvas.width;
          croppedCanvas.height = canvas.height - topBorderHeight - bottomBorderHeight;
          // Draw the cropped image onto the new canvas
          croppedCtx.drawImage(canvas, 0, topBorderHeight, canvas.width, canvas.height - topBorderHeight - bottomBorderHeight, 0, 0, canvas.width, canvas.height - topBorderHeight - bottomBorderHeight);

          // Convert the canvas back to a data URL
          var croppedDataUrl = croppedCanvas.toDataURL();

          // Resolve the Promise with the cropped data URL
          resolve(croppedDataUrl);
      };

      // Handle errors if the image fails to load
      img.onerror = function() {
          reject(new Error('Failed to load the image.'));
      };
  });
}





// Define function to get video information
function getVideoInfo_old(videoId) {
  var apiKey = 'AIzaSyAi9TmRbAeBiTxzxtUGoDiyVHOhW63GYNc'; // Replace with your API key
  var videoUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + videoId + '&key=' + apiKey + '&part=snippet';
  console.log(videoUrl);
  // Fetch video data
  fetch(videoUrl)
    .then(response => response.json())
    .then(videoData => {
      var snippet = videoData.items[0].snippet;
      var statistics = videoData.items[0].statistics;
      var contentDetails = videoData.items[0].contentDetails;
      var thumbnailUrl = snippet.thumbnails.maxres.url;
      var title = snippet.title;
      var channelName = snippet.channelTitle;
      var description = snippet.description;
      var views = formatViews(statistics.viewCount);
      var length = formatDuration(contentDetails.duration);
      var channelId = snippet.channelId;
      var publishDate = formatDate(snippet.publishedAt); // Format publish date
      
      // Fetch channel information including subscriber count and channel icon
      var channelUrl = 'https://www.googleapis.com/youtube/v3/channels?id=' + channelId + '&key=' + apiKey + '&part=snippet,statistics';
      
      fetch(channelUrl)
        .then(response => response.json())
        .then(channelData => {
          var subscriberCount = formatViews(channelData.items[0].statistics.subscriberCount);
          var channelIcon = channelData.items[0].snippet.thumbnails.default.url; // Channel icon URL
          
          // Return array of video information
          return [thumbnailUrl, title, channelName, description, views, length, subscriberCount, publishDate, channelIcon];
        })
        .catch(error => console.error('Error fetching channel data: ', error));
    })
    .catch(error => console.error('Error fetching video data: ', error));
}

// Define function to format views count
function formatViews(views) {
  if (views >= 1e9) {
    return (views / 1e9).toFixed(1) + 'B';
  } else if (views >= 1e6) {
    return (views / 1e6).toFixed(1) + 'M';
  } else if (views >= 1e3) {
    return (views / 1e3).toFixed(1) + 'K';
  } else {
    return views.toString();
  }
}

// Define function to format video duration
function formatDuration(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  var hours = (match[1] ? parseInt(match[1]) : 0);
  var minutes = (match[2] ? parseInt(match[2]) : 0);
  var seconds = (match[3] ? parseInt(match[3]) : 0);
  
  var formattedDuration = '';
  if (hours > 0) {
    formattedDuration += hours + 'h ';
  }
  if (minutes > 0 || hours > 0) {
    formattedDuration += minutes + 'm ';
  }
  formattedDuration += seconds + 's';
  
  return formattedDuration.trim();
}

// Define function to format video publish date
function formatDate(dateString) {
  var date = new Date(dateString);
  var now = new Date();
  var diff = now - date;
  var seconds = Math.floor(diff / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  var months = Math.floor(days / 30); // Calculate months
  var years = Math.floor(days / 365); // Calculate years
  
  if (years > 0) {
    return years + (years == 1 ? ' year ago' : ' years ago');
  } else if (months > 0) {
    return months + (months == 1 ? ' month ago' : ' months ago');
  } else if (days > 0) {
    return days + (days == 1 ? ' day ago' : ' days ago');
  } else if (hours > 0) {
    return hours + (hours == 1 ? ' hour ago' : ' hours ago');
  } else if (minutes > 0) {
    return minutes + (minutes == 1 ? ' minute ago' : ' minutes ago');
  } else {
    return 'Just now';
  }
}