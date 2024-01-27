
use("users_db");


// Insert users with embedded posts

db.users.insertMany([
    {
      image: "https://www.baaa.dk/media/b5ahrlra/maria-louise-bendixen.jpg?anchor=center&mode=crop&width=800&height=450&rnd=132792921650330000&format=webp",
      mail: "mlbe@eaaa.dk",
      name: "Maria Louise Bendixen",
      title: "Senior Lecturer",
      posts: [
        {
          caption: "Beautiful sunset at the beach",
          createdAt: new Date("2023-04-05T15:27:14Z"),
          image: "https://images.unsplash.com/photo-1566241832378-917a0f30db2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
          
        {
          caption: "My dog",
          createdAt: new Date("2021-04-05T15:27:14Z"),
          image: "https://images.unsplash.com/photo-1601758665674-4c8d8a4e4c0f?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwYmFyfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
        }
        ]
    },

    {
        image: "https://share.cederdorff.dk/images/race.jpg",
        mail: "race@eaaa.dk",
        name: "Rasmus Cederdorff",
        title: "Senior Lecturer",
        posts: [
            
            {
                caption: "A cozy morning with coffee",
                createdAt: new Date("2023-04-03T08:21:04Z"),
                image: "https://images.unsplash.com/photo-1545319261-f3760f9dd64d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            }
        ]
    },
    
    {
        image: "https://www.eaaa.dk/media/bdojel41/dan-okkels-brendstrup.jpg?anchor=center&mode=crop&width=800&height=450&rnd=132792921559630000&format=webp",
        mail: "dob@eaaa.dk",
        name: "Dan Okkels Brendstrup",
        title: "Lecturer",
        posts: [

            {
                caption: "Beautiful sunset at the beach",
                createdAt: new Date("2023-04-05T15:27:14Z"),
                image: "https://images.unsplash.com/photo-1566241832378-917a0f30db2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",

            }
        ]

    }
]);

       
// Read all data from users collection

//db.users.find();

// Read all data from posts collection
//db.users.find({}, { _id: 0, posts: 1 })

// Find one user to get posts by name
//db.users.findOne({ name: "Maria Louise Bendixen" }, { _id: 0, posts: 1 })

// Get all posts in one array with unwind and group stages

//db.users.aggregate([
    //{
    // $unwind: "$posts"
   // },
   // {
    //  $group: {
      //  _id: null,
      //  allPosts: { $push: "$posts" }
     // }
  //  },
   // {
    //  $project: {
      //  _id: 0,
      //  allPosts: 1
     // }
   // }
 // ])

 