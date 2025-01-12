from datetime import datetime, date
from app import db

# 添加点赞和收藏的关联表
post_likes = db.Table('post_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True)
)

post_favorites = db.Table('post_favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(11), unique=True, nullable=False)
    nickname = db.Column(db.String(64), nullable=False)
    points = db.Column(db.Integer, default=0)
    student_id = db.Column(db.String(20))
    department = db.Column(db.String(100))
    real_name = db.Column(db.String(64))
    last_like_date = db.Column(db.Date)  # 记录最后一次点赞的日期
    last_favorite_date = db.Column(db.Date)  # 记录最后一次收藏的日期
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    liked_posts = db.relationship('Post', secondary=post_likes, lazy='dynamic')
    favorite_posts = db.relationship('Post', secondary=post_favorites, lazy='dynamic')

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    likes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    liked_by = db.relationship('User', secondary=post_likes, 
        backref=db.backref('_liked_posts', lazy='dynamic'),
        lazy='dynamic',
        cascade='all, delete')
    favorited_by = db.relationship('User', secondary=post_favorites,
        backref=db.backref('_favorite_posts', lazy='dynamic'),
        lazy='dynamic',
        cascade='all, delete')

    @property
    def likes_count(self):
        return self.liked_by.count()

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

    @classmethod
    def migrate_comments(cls, db_session):
        # 获取所有没有 post_id 的评论
        comments = cls.query.filter(cls.post_id.is_(None)).all()
        
        # 为每个评论找到对应的帖子
        for comment in comments:
            # 这里需要根据你的业务逻辑来确定评论属于哪个帖子
            # 例如，可以根据时间戳或其他关联信息来判断
            post = Post.query.filter(...).first()
            if post:
                comment.post_id = post.id
        
        db_session.commit()

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False) 