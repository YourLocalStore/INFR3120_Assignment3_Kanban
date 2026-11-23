let mongoose = require('mongoose')

let kanbanModel = mongoose.Schema({

    /* 
    EXAMPLE OF THE JSON SCHEMA

       ColumnName                      kanbanTask                  
    [{ {"Col1"}, [{"Task1", "Description"}, {"Task2", "Description"}] }, 
     { {"Col2"}, [{"Task1", "Description"}, {"Task2", "Description"}] },
     { {"Col3"}, [{"Task1", "Description"}, {"Task2", "Description"}] }] 

    Arrays are needed here to support multiple columns and tasks, and we need to iterate over them
    */
    kanbanColumn: [{
        kanbanColumnName: {
            type: String,
            required: "Enter the column name"
        },
        kanbanTask: [{
            kanbanTaskName:{
                type: String,
                required: "Enter the task being done"
            },
            description: String,
        }]
    }],
},
{
    collection: "Boards"
})

module.exports = mongoose.model("kanban", kanbanModel)
