loadComments = (id) => {
    console.log("none");
}

$("#submit").on("click", () =>{
    event.preventDefault();

    $.ajax({
        type: "POST",
        url: "/submit",
        dataType: "json",
        data: {
            commentText: $("#comment").val(),
            id: $("#submit").attr("data-id")
        }
    }).then((data) =>{
        loadComments($("#submit").attr("data-id"));
    })
})