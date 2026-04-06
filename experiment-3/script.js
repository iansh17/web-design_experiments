function addTask() {
    let task = document.getElementById("taskInput").value;

    let li = document.createElement("li");
    li.innerText = task;

    li.onclick = function() {
        li.remove();
    };

    document.getElementById("taskList").appendChild(li);
}