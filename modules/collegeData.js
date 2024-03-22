const fs = require("fs");

//Managing data
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

//Initializing the data module
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses");
                return;
            }

            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students");
                    return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

//Retrieving all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.students);
    });
}


//Retrieving all courses
module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.courses);
    });
};

//Retrieving a student by student number
module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("no results returned");
            return;
        }

        resolve(foundStudent);
    });
};

//Retrieving students by course
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("no results returned");
            return;
        }

        resolve(filteredStudents);
    });
};


module.exports.addStudent = function(studentData){
    return new Promise((resolve, reject) => {
        if (studentData.TA === undefined) {
          studentData.TA = false;
        } else {
          studentData.TA = true;
        }
    
        studentData.studentNum = dataCollection.students.length + 1;
    
        dataCollection.students.push(studentData);
    
        resolve();
     });
}

module.exports.getcourseById = function(id){
    return new Promise(function (resolve, reject) {
        var foundCourse = null;

        for (let i = 0; i < dataCollection.courses.length; i++) {
            if (dataCollection.courses[i].courseId == id) {
                foundCourse = dataCollection.courses[i];
            }
        }

        if (!foundCourse) {
            reject("query returned 0 results"); return;
        }

        resolve(foundCourse);
    });

}

module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        var findStudent = null;
        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == studentData.studentNum) {
                findStudent = dataCollection.students[i];
            }
        }
        if (findStudent) {
            findStudent.firstName = studentData.firstName;
            findStudent.lastName = studentData.lastName,
                findStudent.email = studentData.email,
                findStudent.addressStreet = studentData.addressStreet,
                findStudent.addressCity = studentData.addressCity,
                findStudent.addressProvince = studentData.addressProvince,
                findStudent.TA = studentData.TA,
                findStudent.status = studentData.status,
                findStudent.course = studentData.course
            console.log(dataCollection.students);
            fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students), 'utf8', function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            resolve();
        } else {

            reject("query returned 0 results");
            return;
        }

    });
};