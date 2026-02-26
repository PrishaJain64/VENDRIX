//initial start date
  const startdate = document.getElementById("startdate");
  const today = new Date();
  today.setDate(today.getDate()+3);
  let minDate = today.toISOString().split("T")[0];
  startdate.min = minDate;
  startdate.value = minDate;

  //initial end date
  const enddate = document.getElementById("enddate");
  today.setDate(today.getDate()+7);
  let minenddate = today.toISOString().split("T")[0];
  enddate.min = minenddate;
  enddate.value = minenddate;

startdate.addEventListener("change",function(){
  sd = startdate.value;
  var newdate = new Date(sd);
  newdate.setDate(newdate.getDate()+7);
  minenddate = newdate.toISOString().split("T")[0];
  enddate.min = minenddate;
  enddate.value = minenddate;
})
