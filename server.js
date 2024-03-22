/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Prasiddha Thapaliya Student ID:121569230 Date: 22nd March, 2024
*
*  Online (Cycliic) Link: https://panicky-lamb-nightgown.cyclic.app
*
********************************************************************************/ 
const express = require("express");

const exphbs = require('express-handlebars'); 

const path = require("path");

//Importing the module for college data
const data = require("./modules/collegeData.js");

const app = express();

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs' ,
    helpers:
    {
navLink: function(url, options){
    return `<li class="nav-item">
    <a class="nav-link ${url == app.locals.activeRoute ? "active" : "" }"
    href="${url}">${options.fn(this)}</a>
    </li>`;
   },

   equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
    return options.inverse(this);
    } else {
    return options.fn(this);
    }
   }}}));

app.set('view engine', 'hbs');

app.set('views', './views'); 

//Defining the port number
const HTTP_PORT = process.env.PORT || 8080;

app.use (express.urlencoded({ extended: true }) );
//Serving static files from the "public" directory
app.use(express.static("public"));

//Navigation Bar to Show the correct "active" item
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
   });

app.get("/", (req,res) => {
    res.render('home');
});

app.get("/about", (req,res) => {
    res.render('about');
});

app.get("/htmlDemo", (req,res) => {
    res.render('htmlDemo');
});

app.get("/students/add", (req,res) => {
    res.render('addStudent');
});

app.post("/students/add", (req, res)=>{
    // console.log(req.body);
    data.addStudent(req.body)
    .then(() => {
        res.redirect('/students');
    })
    .catch(error => {
        res.status(500).send('Error adding student: ' + error.message);
    });
});


//Routing to get all students or students by course
app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render('students', {
                students:data
            })
        }).catch((err) => {
            res.json({ message: "no results" });
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render('students', {
                students: data
            });
            
        }).catch((err) => {
            res.render('students',{
                message: "no results"
            })
            
        });
    }
});

//Routing to get a single student by student number
app.get("/student/:studentNum", (req, res) => {
    data.getStudentByNum(req.params.studentNum).then((data) => {
        res.render("student", {
            student:data
        });
    }).catch((err) => {
        res.json({message:"no results"});
    });
});

app.post("/student/update", (req, res) => {
    console.log(req.body);
    data.updateStudent(req.body);
    res.redirect("/students");
});

//Routing to get all courses
app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        res.render('courses',{
            courses: data
        })
    });
});

app.get("/course/:courseID",(req, res) =>{
    
    data.getcourseById(req.params.courseID).then((data) => {
        res.render('course',{
            course:data
        });
        
    });
});

//Handling 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

//Initializing the data module and starting the server
data.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("app listening on: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("unable to start server: " + err);
    });