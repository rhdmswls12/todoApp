const { response } = require('express');
const express=require('express');
const app=express();
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
const MongoClient=require('mongodb').MongoClient;
const methodOverride=require('method-override');
app.use(methodOverride('_method'));
app.use('/public',express.static('public'));

const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const session=require('express-session');

app.use(session({secret:'비밀코드',resave:true, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());


var db;
MongoClient.connect('mongodb+srv://admin1:qwer1234@cluster0.quwargd.mongodb.net/?retryWrites=true&w=majority',function(error,client){
    if(error){
        return console.log(error)
    }
    db=client.db('todoapp2');

    // db.collection('post').insertOne({이름:'john',나이:20},function(error,result){
    //     console.log('저장완료');
    // });
    app.listen(8080, function(){
        console.log('listening on 8080')
    });
})


app.get('/pet',function(요청,응답){
    응답.send('펫용품 쇼핑 사이트입니다.');
})
app.get('/beauty',function(request,response){
    response.send('뷰티용품 사세용')
});

app.get('/',function(request,response){
    response.render('index.ejs')
})
app.get('/write',function(request,response){
    response.render('write.ejs')
})
app.post('/add',function(request,response){
    response.send('전송완료');
    db.collection('count').findOne({name:'게시물 개수'},function(error,result){
        console.log(result.totalPost);
        var total=result.totalPost;
    db.collection('post').insertOne({_id:total+1, title:request.body.title,date:request.body.date},function(error,result){
        console.log('저장완료');
        console.log(request.body);
        db.collection('count').updateOne({name:'게시물 개수'},{$inc:{totalPost:1}},function(error,result){
            if(error){
                return console.log(error);
            }
        })
        });
    });
})
app.get('/list',function(request,response){
    db.collection('post').find().toArray(function(error,result){
        console.log(result); 
        response.render('list.ejs',{posts:result}); 
                                //이런 이름으로 //이런 데이터를
    });
})
app.delete('/delete',function(request,response){
    console.log(request.body);
    request.body._id=parseInt(request.body._id);
    db.collection('post').deleteOne(request.body,function(error,result){
        console.log('삭제완료');
        response.status(200).send({
            message:'성공했습니다.'
        });
    })
})
app.get('/detail/:id',function(request,response){
    db.collection('post').findOne({_id:parseInt(request.params.id)},function(error,result){
        console.log(result);
        response.render('detail.ejs',{data:result});
    })
})
app.get('/edit/:id',function(request,response){
    db.collection('post').findOne({_id:parseInt(request.params.id)},function(error,result){
        console.log(result);
        response.render('edit.ejs',{willEdit:result});
    })
})
app.put('/edit',function(request,response){
    db.collection('post').updateOne(
        {_id:parseInt(request.body.id)},
        {$set:{title:request.body.title, date:request.body.date}},
        function(error,result){
        console.log('수정완료');
        response.redirect('/list');
        });
    });
app.get('/login',function(request,response){
    response.render('login.ejs')
});
app.post('/login',passport.authenticate('local',{
    failureRedirect:'/fail'
}), function(request,response){
 response.redirect('/');   
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));
  passport.serializeUser(function(user,done){
    done(null,user.id)
  });
  passport.deserializeUser(function(아이디,done){
    done(null,{})
  });