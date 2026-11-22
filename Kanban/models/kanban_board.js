let mongoose = require('mongoose')

let kanbanModel = mongoose.Schema({
    kanbanColumnName:           String,
    kanbanTaskCardHeader:       String,
    kanbanTaskCardDescription:  String,
},
{
    Collection: "kanbanBoards"
})

module.exports = mongoose.model("kanban", kanbanModel)
