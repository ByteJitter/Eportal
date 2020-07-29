// 获取二级联动搜索下拉框选项
function getSelectData(projectLists, itemlist) {
  let arr = [];
  let obj = handleProjectLists(projectLists);

  itemlist = itemlist || ['number','name','manager','status','level','type'];

  itemlist.forEach(item => {
    arr.push(obj[item]);
  });
  return arr;
}

function handleProjectLists(projectLists) {
  let initObj = {
    name: {},
    number: {},
    status: {},
    level: {},
    manager: {},
    is_reward: {}
  }
  let obj = projectLists.reduce((init, project) => {
    let name = project['name'];
    let number = project['number'];
    let status = project['status'];
    let level = project['level'];
    let is_reward = project['is_reward'];
    let managerId, managerName;

    if (project['managerInfo']) {
      managerId = project['managerInfo']['_id'];
      managerName = project['managerInfo']['name'];
    } else {
      managerId = project['manager']['_id'];
      managerName = project['manager']['name'];
    }

    if (!init.name[name]) {
      init.name[name] = name;
    }

    if (!init.number[number]) {
      init.number[number] = number;
    }

    if (!init.status[status]) {
      init.status[status] = { value: status, text: project['status_name'] };
    }

    if (!init.level[level]) {
      init.level[level] = { value: level, text: project['level_name'] };
    }

    if (!init.manager[managerId]) {
      init.manager[managerId] = { value: managerId, text: managerName };
    }

    if (!init.is_reward[is_reward]) {
      if (is_reward) {
        init.is_reward[is_reward] = { value: is_reward, text: '奖励项目' };
      } else {
        init.is_reward[is_reward] = { value: is_reward, text: '一般项目' };
      }
    }

    return init;
  }, initObj);

  let name = { value: 'name', text: '项目名称', itemsStatus: Object.values(obj.name) };
  let number = { value: 'number', text: '项目编号', itemsStatus: Object.values(obj.number) };
  let status = { value: 'status', text: '项目状态', itemsStatus: Object.values(obj.status) };
  let level = { value: 'level', text: '项目等级', itemsStatus: Object.values(obj.level) };
  let manager = { value: 'manager', text: '项目经理', itemsStatus: Object.values(obj.manager) };
  let type = { value: 'is_reward', text: '项目类别', itemsStatus: Object.values(obj.is_reward) };

  return { name, number, status, level, manager, type };
}

function handleLists(lists, property, propertyName){
  let obj = lists.reduce((init, list) => {
    let status = list[property];
    if (!init[status]) {
      init[status] = { value: status, text: list[propertyName] };
    }
    return init;
  }, {});
  return Object.values(obj);
}

export { getSelectData, handleLists }
