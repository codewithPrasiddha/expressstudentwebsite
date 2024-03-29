const Sequelize = require('sequelize');

const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'G3PsQmfz4oBv', {
    host: 'ep-dawn-star-a57qi3gz-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Student = sequelize.define("Student", {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
});

var Course = sequelize.define("Course", {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, { foreignKey: "course" });

//Initializing the data module
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                console.log("Database synced successfully.");
                resolve();
            })
            .catch((error) => {
                console.error("Error syncing database:", error);
                reject("Unable to sync the database");
            });
    });
}

//Retrieving all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then((students) => {
                if (students && students.length > 0) {
                    resolve(students);
                } else {
                    reject("No results returned");
                }
            })
            .catch((error) => {
                console.error("Error fetching students:", error);
                reject("Unable to fetch students");
            });
    });
}


//Retrieving all courses
module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then((courses) => {
                if (courses && courses.length > 0) {
                    resolve(courses);
                } else {
                    reject("No results returned");
                }
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
                reject("Unable to fetch courses");
            });
    });
};

//Retrieving a student by student number
module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findOne({
            where: {
                studentNum: num,
            },
        })
            .then((student) => {
                if (student) {
                    resolve(student);
                } else {
                    reject("No results returned");
                }
            })
            .catch((error) => {
                console.error("Error fetching student by studentNum:", error);
                reject("Unable to fetch student by studentNum");
            });
    });
};

//Retrieving students by course
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                course: course,
            },
        })
            .then((students) => {
                if (students && students.length > 0) {
                    resolve(students);
                } else {
                    reject("No results returned");
                }
            })
            .catch((error) => {
                console.error("Error fetching students by course:", error);
                reject("Unable to fetch students by course");
            });
    });
};


module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {

        studentData.TA = studentData.TA ? true : false;


        for (const prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.create(studentData)
            .then(() => {
                resolve("Student created successfully");
            })
            .catch((error) => {
                console.error("Error creating student:", error);
                reject("Unable to create student");
            });
    });
}

module.exports.getcourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: {
                courseId: id,
            },
        })
            .then((courses) => {
                if (courses && courses.length > 0) {
                    resolve(courses[0]);
                } else {
                    reject("No results returned");
                }
            })
            .catch((error) => {
                console.error("Error fetching course by ID:", error);
                reject("Unable to fetch course by ID");
            });
    });

}

module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {

        studentData.TA = studentData.TA ? true : false;


        for (const prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, {
            where: { studentNum: studentData.studentNum },
        })
            .then(() => {
                resolve("Student updated successfully");
            })
            .catch((error) => {
                console.error("Error updating student:", error);
                reject("Unable to update student");
            });
    });
};

module.exports.addCourse = function (courseData) {
    courseData.courseCode = courseData.courseCode || null;
    courseData.courseDescription = courseData.courseDescription || null;

    return new Promise((resolve, reject) => {
        Course.create(courseData)
            .then(() => {
                console.log("Course created successfully.");
                resolve();
            })
            .catch((error) => {
                console.error("Error creating course:", error);
                reject("Unable to create course");
            });
    });
};

module.exports.updateCourse = function (courseData) {
    courseData.courseCode = courseData.courseCode || null;
    courseData.courseDescription = courseData.courseDescription || null;

    return new Promise((resolve, reject) => {
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId,
            },
        })
            .then(() => {
                console.log("Course updated successfully.");
                resolve();
            })
            .catch((error) => {
                console.error("Error updating course:", error);
                reject("Unable to update course");
            });
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: {
                courseId: id,
            },
        })
            .then((rowsDeleted) => {
                if (rowsDeleted > 0) {
                    console.log(`Course with ID ${id} deleted successfully.`);
                    resolve();
                } else {
                    reject(`Course with ID ${id} not found`);
                }
            })
            .catch((error) => {
                console.error("Error deleting course:", error);
                reject("Unable to delete course");
            });
    });
};

module.exports.deleteStudentByNum=function(studentNum) {
    return new Promise((resolve, reject) => {
      Student.destroy({
        where: { studentNum: studentNum }
      })
      .then((rowsDeleted) => {
        if (rowsDeleted === 0) {
          reject({ message: "Student not found" });
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  }