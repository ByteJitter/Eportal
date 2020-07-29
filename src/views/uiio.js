db.getCollection('employees').aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "employeeInfo"
    }
  },
  {
    $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true}
  },
  {
    $lookup: {
      from: "bonuswaits",
      localField: "_id",
      foreignField: "employee_id",
      as: "bonusInfo"
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      'employeeInfo.name': 1,
      'bonusInfo.amount':1,
      'bonusInfo.bonus_type':1
    }
  },
  {
    $unwind: { path: "$bonusInfo", preserveNullAndEmptyArrays: true}
  },
  {
    $group :{
      _id: {
        "name": "$name"
      },
      "type": {$push : {type:"$bonusInfo.bonus_type",amount:"$bonusInfo.amount"}},
      //"amount": {$push: "$bonusInfo.amount"}
    }
  },
  {

    $project:{
      "_id":1,
      "amount":{
        $switch:{
          "branches":[{
            case: {
              $eq: ["$type.type", "双薪"]
            },
            then: "$type.amount"
          }],
          default:"error"
        }
      }
    }
  }
])