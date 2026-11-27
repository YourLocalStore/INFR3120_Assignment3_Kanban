let express = require('express');
let router = express.Router();
let mongoose = require("mongoose")

let kanban = require("../models/kanban_board")


function requireAuth(req, res, next){
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    next();
} 
router.use(requireAuth)

// Read
router.get("/boards", async(req, res, next) => {
    try{
        const userBoard = await kanban.find({
            boardOwner: req.user._id
        });
        res.render("kanban/boards", {
            title: "Board",
            userBoard:userBoard,
            displayName: req.user ? req.user.displayName:""
        })
    }
    catch(err){
        console.log(err)
        res.render("kanban/boards", {
            title: "Boards",
            userBoard: [], 
            error: "Error on Server"
        })
    }
})

// Create column, which also initiates the board that the user will use.
router.get("/addcolumn", async(req, res, next) => {
    try{
        res.render("kanban/addnew", {
            title: "Add an Event",
            displayName: req.user ? req.user.displayName:"",
            boardOwner: req.user._id
        })

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

router.post("/addcolumn", async(req, res, next) => {
    try{
        let kanbanBoard = await kanban.findOne({
            boardOwner: req.user._id
        }); // The "board" in this sense is the singular DB entry the user makes
        
        // If the DB entry for this user's board exists
        if(kanbanBoard){
            // https://www.w3schools.com/jsref/jsref_concat_array.asp
            kanbanBoard.kanbanColumn = kanbanBoard.kanbanColumn.concat({
                kanbanColumnName: req.body.kColName,
            })
            await kanban.updateOne(
                {boardOwner: req.user._id}, // Filter
                kanbanBoard                 // Update
            )
        
        // Otherwise, they do not have a board.
        } else{
            kanbanBoard = kanban({
                boardOwner: req.user._id,
                kanbanColumn: [{
                    kanbanColumnName: req.body.kColName
                }]
            })  
            await kanban.create(kanbanBoard)           
        }
        res.redirect("/boards") 

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

// Create a new task
router.get("/addtask/column/:id", async(req, res, next) => {
    try{
        const colID = req.params.id
        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        }) 
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // The ID in JS is returned as an object instead of a string.
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }
        res.render("kanban/addtask", {
            title: "Add a task",
            colToEdit: colToEdit,
            displayName: req.user ? req.user.displayName:"",
            boardOwner: req.user._id
        })

    } catch(err) {
        console.log(err)
        res.render("kanban/addtask", {
            title: "Error!",
            error: err
        })
    }
})

router.post("/addtask/column/:id", async(req, res, next) => {
    try{
        const colID = req.params.id
        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        }) 
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // ObjectID is obtained by default. Must turn into a string
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }
        colToEdit.kanbanTask = colToEdit.kanbanTask.concat({
            kanbanTaskName: req.body.kColTask,
            description:    req.body.kColDescription    
        })
        await kanban.findByIdAndUpdate({
                _id: boardToFind._id, 
                boardOwner: req.user._id
            }, 
            {kanbanColumn: boardToFind.kanbanColumn}
        )
        res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/addtask", {
            title: "Error!",
            error: err
        })
    }
})

// Update the Task
router.get("/updatetask/column/:colID/task/:taskID", async(req, res, next) => {
    try{
        const colID = req.params.colID
        const taskID = req.params.taskID

        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        }) 
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // The ID in JS is returned as an object instead of a string.
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }

        let colTask = colToEdit.kanbanTask.find(
            task => task._id.toString() == taskID
        )

        res.render("kanban/edit", {
            title: "Update a Task",
            colTask: colTask,
            displayName: req.user ? req.user.displayName:"",
            boardOwner: req.user._id
        })

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

router.post("/updatetask/column/:colID/task/:taskID", async(req, res, next) => {
    try{
        const colID = req.params.colID
        const taskID = req.params.taskID

        let boardToFind = await kanban.findOne()
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // The ID in JS is returned as an object instead of a string.
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }

        let colTask = colToEdit.kanbanTask.find(task => 
            task._id.toString() == taskID
        )

        // We only need to call 'colTask' and its properties because it directly references the kanbanTask array.
        colTask.kanbanTaskName = req.body.kColTask
        colTask.description    = req.body.kColDescription

        await kanban.findByIdAndUpdate({
                _id: boardToFind._id, 
                boardOwner: req.user._id
            }, 
            {kanbanColumn: boardToFind.kanbanColumn}
        )
        res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

// Update the Column Name
router.get("/updatecolname/column/:colID", async(req, res, next) => {
    try{
        const colID = req.params.colID

        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        })
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // The ID in JS is returned as an object instead of a string.
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }

        res.render("kanban/edit_colname", {
            title: "Update the Column Name",
            colName: colToEdit.kanbanColumnName,
            displayName: req.user ? req.user.displayName:"",
            boardOwner: req.user._id
        })

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

router.post("/updatecolname/column/:colID", async(req, res, next) => {
    try{
        const colID = req.params.colID

        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        })
        let colToEdit;

        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // The ID in JS is returned as an object instead of a string.
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }

        // We only need to call 'colTask' and its properties because it directly references the kanbanTask array.
        colToEdit.kanbanColumnName = req.body.kColName

        await kanban.findByIdAndUpdate({
                _id: boardToFind._id, 
                boardOwner: req.user._id
            }, 
            {kanbanColumn: boardToFind.kanbanColumn}
        )
        res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/addnew", {
            title: "Error!",
            error: err
        })
    }
})

// Delete Entire Board (The DB entry)
router.get("/deleteboard/:id", async(req, res, next) => {
    try{
        let boardID  = req.params.id
        await kanban.deleteOne({
                _id: boardID,
                boardOwner: req.user._id
            }
        )
        await res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/boards", {
            title: "Error!",
            error: err
        })        
    }
})

// Delete Entire Column
router.get("/deletecolumn/:id", async(req, res, next) => {
    try{
        let colID  = req.params.id
        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        })

        boardToFind.kanbanColumn = boardToFind.kanbanColumn.filter(
            column => column._id.toString() != colID
        )

        await kanban.findByIdAndUpdate({
                _id: boardToFind._id, 
                boardOwner: req.user._id
            }, 
            {kanbanColumn: boardToFind.kanbanColumn}
        )
        res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/boards", {
            title: "Error!",
            error: err
        })        
    }
})

// Delete Specific Task
router.get("/deletetask/column/:colID/task/:taskID", async(req, res, next) => {
    try{
        let colID  = req.params.colID
        let taskID = req.params.taskID

        let boardToFind = await kanban.findOne({
            boardOwner: req.user._id
        })
        let colToEdit;

        /*
            We have to somehow edit the column by looping into the schema for the proper column.
            Once the column has been found, the column gets filtered for its tasks and returns a new array.
        */
        for(let i = 0; i < boardToFind.kanbanColumn.length; i++){
            if(boardToFind.kanbanColumn[i]._id.toString() == colID){ // Object is obtained by default. Must turn into a string
                colToEdit = boardToFind.kanbanColumn[i]
            }
        }
        
        colToEdit.kanbanTask = colToEdit.kanbanTask.filter(
            task => task._id.toString() != taskID // Exclude the task that we want to filter out
        )

        await kanban.findByIdAndUpdate({
                _id: boardToFind._id, 
                boardOwner: req.user._id
            }, 
            {kanbanColumn: boardToFind.kanbanColumn}
        )
        res.redirect("/boards")

    } catch(err) {
        console.log(err)
        res.render("kanban/boards", {
            title: "Error!",
            error: err
        })        
    }
})

module.exports = router;