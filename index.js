const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite = require('sqlite');
const dbConnection = sqlite.open('banco.sqlite', { Promise });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

//callback
app.get('/', async(request, response) => {
    const db = await dbConnection;
    const dbCategories = await db.all('select * from categories');
    const jobs = await db.all('select * from jobs');
    const categories = dbCategories.map(cat => {
        return{
            ...cat,
            jobs : jobs.filter( job => job.category === cat.id)
        }
    });
    response.render('home', {
        categories
    });
    
});

app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection;
    const job = await db.get('select * from jobs where id = '+request.params.id);
    response.render('vaga', {
        job
    });
    
});




app.get('/admin', (request, response) => {
    response.render('admin/home');
});


//categorias
app.get('/admin/categorias', async(request, response) => {
    const db = await dbConnection;
    const categories = await db.all('select * from categories');
    response.render('admin/categorias', {categories});
});


//deletar categoria
app.get('/admin/categorias/delete/:id', async(request, response) => {
    const db = await dbConnection;
    const jobs = await db.all('select * from jobs');
    const category = jobs.map(job => job.category);
    const verify = category.filter(cat => cat == request.params.id);
    

    if(verify.length === 0){
        await db.run('delete from categories where id = '+request.params.id);
    }else{
        console.log("Erro: Categoria nao vazia.");
    }
        response.redirect('/admin/categorias');  
});


//nova categoria
app.get('/admin/categorias/nova', async(request, response) => {
    response.render('admin/nova-categoria');
});

app.post('/admin/categorias/nova', async(request, response) => {
    const db = await dbConnection;
    const {category} = request.body; 
    await db.run(`insert into categories(category) values('${category}')`);
    response.redirect('/admin/categorias');
});






//editar vaga
app.get('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const categories = await db.all('select * from categories');
    const job = await db.get('select * from jobs where id ='+request.params.id);
    response.render('admin/editar-vaga', { categories, job });
});
app.post('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const { title, description, category } = request.body;
    const { id } = request.params;
    await db.run(`update jobs set category = '${category}', title = '${title}', description = '${description}' where id = ${id}`);
    response.redirect('/admin/vagas');
});




//editar categoria
app.get('/admin/categorias/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const category = await db.get('select * from categories where id ='+request.params.id);
    response.render('admin/editar-categoria', { category });
});
app.post('/admin/categorias/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const { category } = request.body;
    const { id } = request.params;
    await db.run(`update categories set category = '${category}' where id = ${id}`);
    response.redirect('/admin/categorias');
});



//vagas
app.get('/admin/vagas', async(request, response) => {
    const db = await dbConnection;
    const jobs = await db.all('select * from jobs');
    response.render('admin/vagas', {jobs});
});


//deletar vaga
app.get('/admin/vagas/delete/:id', async(request, response) => {
    const db = await dbConnection;
    await db.run('delete from jobs where id = '+request.params.id);
    response.redirect('/admin/vagas');
});



//nova vaga
app.get('/admin/vagas/nova', async(request, response) => {
    const db = await dbConnection;
    const categories = await db.all('select * from categories');
    response.render('admin/nova-vaga', { categories });
});
app.post('/admin/vagas/nova', async(request, response) => {
    const db = await dbConnection;
    const {title, description, category} = request.body; 
    await db.run(`insert into jobs(category, title, description) values('${category}', '${title}', '${description}')`);
    response.redirect('/admin/vagas');
});



//editar vaga
app.get('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const categories = await db.all('select * from categories');
    const job = await db.get('select * from jobs where id ='+request.params.id);
    response.render('admin/editar-vaga', { categories, job });
});
app.post('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection;
    const { title, description, category } = request.body;
    const { id } = request.params;
    await db.run(`update jobs set category = '${category}', title = '${title}', description = '${description}' where id = ${id}`);
    response.redirect('/admin/vagas');
});

const init = async() => {
    const db = await dbConnection;
    await db.run('create table if not exists categories (id INTEGER PRIMARY KEY, category TEXT);');
    await db.run('create table if not exists jobs (id INTEGER PRIMARY KEY, category INTEGER, title TEXT, description TEXT);');
};

init();

app.listen(3000, (err) => {
    if(err){
        console.log('Não foi possível iniciar o servidor do Jobify.');
        }else{
            console.log('Servidor do Jobify inicializado!');
        }

});

