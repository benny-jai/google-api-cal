# google-api-cal
node js project to use google api 
This is created using google api for calenders to add events and update events. API responses to  current query and also add events to the calender. 
To run the api create node folder  using node  package manager and copy files to it . Instal dependencies as per package.json file.
Create account on google and enable google calendar api for your account. this will create credentials .js for you. copy it in to root folder of your node js project. 
Run command npm server it will start listening on port 8080 or set in env variables.
try calling /days?month=your_value&year=some_value to check list of available datesfor the month days.
also run npm push.js to see how it updates events based on input given
Cheers 
