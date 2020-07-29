<template>
    <div class="table">
        <v-data-table :headers="headers" :items="medalList" class="elevation-1" no-data-text="暂无数据">
            <!-- <template v-slot:items="props">
            <td>{{ props.item.projectInfo.number }}</td>
            <td>{{ props.item.projectInfo.name }}</td>
            <td>{{ props.item.type.substring() }}</td>
            <td>{{ props.item.sendEmployeeInfo.name }}</td>
            <td>{{ props.item.employeeInfo.name }}</td>
            <td>{{ props.item.amount}}</td>
            <td>{{ props.item.applyFormInfo.belong_year }}</td>
            <td>{{ props.item.projectInfo.company }}</td>
            </template> -->
            <template v-slot:items="props">
            <td>{{ props.item.projectNumber }}</td>
            <td>{{ props.item.projectName }}</td>
            <td>{{ props.item.type }}</td>
            <td>{{ props.item.sendEmployeeName }}</td>
            <td>{{ props.item.employeeName}}</td>
            <td>{{ props.item.amount}}</td>
            <td>{{ props.item.belong_year }}</td>
            <td>{{ props.item.company }}</td>
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
  name: "medalList",
  props: ["medalList"],
  data() {
    return {
      headers: [
        { text: "项目编号", sortable: false, value: "iD" },
        { text: "项目名称", sortable: false, value: "name" },
        { text: "勋章类别", sortable: false, value: "Type" },
        { text: "发放人员", sortable: false, value: "sendemployee" },
        { text: "员工", sortable: false, value: "name" },
        { text: "点数", sortable: false, value: "amount" },
        { text: "获得年度", sortable: false, value: "year" },
        { text: "项目单位", sortable: false, value: "company" }
      ],
    };
  },
};
</script>
<style scoped>
.table {
  background: #ffffff;
}

</style>
