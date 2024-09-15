const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const blogModel = require("./models").blog;
const userModel = require("./models").user;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "my-session",
    secret: "ewVsqWOyeb",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(flash());

app.get("/", home);
app.get("/blog", blog);
app.get("/add-blog", addBlogView);
app.post("/blog", addBlog);
app.get("/delete-blog/:id", deleteBlog);
app.get("/edit-blog/:id", editBlogView);
app.post("/edit-blog/:id", editBlog);
app.get("/contact", contact);
app.get("/testimonial", testimonial);
app.get("/blog-detail/:id", blogDetail);

app.get("/login", loginView);
app.get("/register", registerView);

app.post("/register", register);
app.post("/login", login);

function loginView(req, res) {
  res.render("login");
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // cek email user apakah ada di database
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    // cek password apakah valid dengan password yang sudah di hash
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    req.session.user = user;

    req.flash("success", "Login berhasil!");

    res.redirect("/");
  } catch (error) {
    req.flash("error", "Something went wrong!");
    res.redirect("/");
  }
}

function registerView(req, res) {
  res.render("register");
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    req.flash("success", "Register berhasil!");
    res.redirect("/register");
  } catch (error) {
    req.flash("error", "Register gagal!");
    res.redirect("/register");
  }
}

function home(req, res) {
  const user = req.session.user;

  res.render("index", { user });
}

async function blog(req, res) {
  const result = await blogModel.findAll();
  const user = req.session.user;

  res.render("blog", { data: result, user });
}

async function deleteBlog(req, res) {
  const { id } = req.params;

  let result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  await blogModel.destroy({
    where: {
      id: id,
    },
  });
  res.redirect("/blog");
}

async function addBlog(req, res) {
  const { title, content } = req.body;
  await blogModel.create({
    title: title,
    content: content,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPeWWU4427WFoUfLn-QiJGLoiIllli8ez1Tw&s",
  });

  res.redirect("/blog");
}

async function editBlogView(req, res) {
  const { id } = req.params;

  const result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  res.render("edit-blog", { data: result });
}

async function editBlog(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  const blog = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!blog) return res.render("not-found");

  blog.title = title;
  blog.content = content;

  await blog.save();

  res.redirect("/blog");
}

function addBlogView(req, res) {
  res.render("add-blog");
}

function contact(req, res) {
  res.render("contact");
}

function testimonial(req, res) {
  res.render("testimonial");
}

async function blogDetail(req, res) {
  const { id } = req.params;
  const result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  console.log("detail", result);

  if (!result) return res.render("not-found");
  res.render("blog-detail", { data: result });
}

app.listen(port, () => {
  console.log("Server is running on PORT :", port);
});
