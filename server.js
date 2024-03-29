/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Prasiddha Thapaliya Student ID:121569230 Date: 24th March, 2024
*
*  Online (Cycliic) Link: https://panicky-lamb-nightgown.cyclic.app
*
********************************************************************************/ 
const express = require("express");

const exphbs = require('express-handlebars'); 

const path = require("path");

const Sequelize = require('sequelize');

const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'G3PsQmfz4oBv', {
    host: 'ep-dawn-star-a57qi3gz-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }, 
    query:{ raw: true }
});

// Authenticate the connection
sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

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

app.get("/students/add", (req, res) => {
    data
        .getCourses()
        .then((courses) => {
            res.render("addStudent", { courses: courses || [] });
        })
        .catch(() => {
            res.render("addStudent", { courses: [] });
        });
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
    data
        .getAllStudents()
        .then((data) => {
            if (data.length > 0) {

                res.render("students", { students: data });
            } else {
                res.render("students", { message: "No results" });
            }
        })
        .catch((error) => {
            res.render("students", { message: "Error retrieving data" });
        });
});

//Routing to get a single student by student number
app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    data
        .getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data;
            } else {
                viewData.student = null;
            }
        })
        .catch((err) => {
            viewData.student = null;
        })
        .then(data.getCourses)
        .then((data) => {
            viewData.courses = data;
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch((err) => {
            viewData.courses = [];

        })
        .then(() => {
            if (viewData.student == null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData });
            }
        });
});

app.post("/student/update", (req, res) => {
    console.log(req.body);
    data.updateStudent(req.body);
    res.redirect("/students");
});

//Routing to get all courses
app.get("/courses", (req, res) => {
    data
        .getCourses()
        .then((data) => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "No results" });
            }
        })
        .catch((error) => {
            res.render("courses", { message: "Error retrieving data" });
        });
});

app.get("/course/:id", (req, res) => {
    const courseId = req.params.id;
    data
        .getcourseById(courseId)
        .then((data) => {
            if (!data) {
                res.status(404).send("Course Not Found");
            } else {
                res.render("course", { course: data });
            }
        })
        .catch((error) => {
            res.render("course", { message: "Error retrieving data" });
        });
});

app.get("/course/delete/:id", (req, res) => {
    const courseId = req.params.id;

    data
        .deleteCourseById(courseId)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(() => {
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

app.get("/students/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;

    data.deleteStudentByNum(studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch((error) => {
            res.status(500).send("Unable to Remove Student / " + error.message);
        });
});

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body);
    res.redirect("/students");
});

app.post("/course/update", (req, res) => {
    data.updateCourse(req.body);
    res.redirect("/courses");
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