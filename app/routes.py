from flask import Blueprint, render_template, jsonify, request, session, redirect, url_for
import random
from app import db
from app.models import User, Post, Comment, Favorite, post_likes, post_favorites
from app.utils.sms import SMSService
from datetime import date

main = Blueprint('main', __name__)

# 存储验证码的临时字典
verification_codes = {}

# 积分奖励配置
POINTS_CONFIG = {
    'post': 5,      # 发帖奖励
    'comment': 2,   # 评论奖励
    'like': 1,      # 每日首次点赞奖励
    'favorite': 1   # 每日首次收藏奖励
}

@main.route('/')
def index():
    return render_template('login.html')

@main.route('/api/send-code', methods=['POST'])
def send_code():
    phone = request.json.get('phone')
    if not phone or len(phone) != 11:
        return jsonify({'error': '请输入有效的手机号'}), 400
    
    # 生成6位数字验证码
    code = str(random.randint(100000, 999999))
    
    # 发送验证码
    sms_service = SMSService()
    if sms_service.send_code(phone, code):
        verification_codes[phone] = code
        return jsonify({'message': '验证码已发送'})
    else:
        return jsonify({'error': '验证码发送失败，请稍后重试'}), 500

@main.route('/api/login', methods=['POST'])
def login():
    phone = request.json.get('phone')
    code = request.json.get('code')
    
    if not phone or not code:
        return jsonify({'error': '请填写完整信息'}), 400
    
    stored_code = verification_codes.get(phone)
    if not stored_code or stored_code != code:
        return jsonify({'error': '验证码错误'}), 400
    
    user = User.query.filter_by(phone=phone).first()
    if not user:
        # 新用户注册
        user = User(phone=phone, nickname=f'用户_{phone[-4:]}')
        db.session.add(user)
        db.session.commit()
    
    # 清除验证码
    verification_codes.pop(phone, None)
    
    # 在登录成功后，添加session
    session['user_id'] = user.id
    
    return jsonify({'message': '登录成功', 'user_id': user.id}) 

@main.route('/index')
def home():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('main.index'))
    
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        return redirect(url_for('main.index'))
    
    # 只获取第一页的帖子
    per_page = 10
    posts = Post.query.order_by(Post.timestamp.desc()).limit(per_page).all()
    
    # 只加载每个帖子的最新3条评论
    for post in posts:
        post.recent_comments = post.comments.order_by(Comment.timestamp.desc()).limit(3).all()
    
    return render_template('index.html', user=user, posts=posts)

@main.route('/api/post', methods=['POST'])
def create_post():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    content = request.json.get('content')
    if not content or len(content) > 140:
        return jsonify({'error': '内容不能为空且不能超过140字'}), 400
    
    user = User.query.get(user_id)
    post = Post(content=content, user_id=user_id)
    
    # 添加发帖积分奖励
    user.points += POINTS_CONFIG['post']
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'message': '发布成功',
        'post_id': post.id,
        'points_earned': POINTS_CONFIG['post'],
        'total_points': user.points
    })

@main.route('/api/like/<int:post_id>', methods=['POST'])
def like_post(post_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    user = User.query.get(user_id)
    post = Post.query.get(post_id)
    points_earned = 0
    
    if post in user.liked_posts:
        user.liked_posts.remove(post)
        liked = False
    else:
        user.liked_posts.append(post)
        liked = True
        # 检查是否是今天第一次点赞
        today = date.today()
        if user.last_like_date != today:
            user.points += POINTS_CONFIG['like']
            points_earned = POINTS_CONFIG['like']
            user.last_like_date = today
    
    db.session.commit()
    return jsonify({
        'likes_count': post.likes_count,
        'liked': liked,
        'points_earned': points_earned,
        'total_points': user.points
    })

@main.route('/api/comment/<int:post_id>', methods=['POST'])
def comment_post(post_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    content = request.json.get('content')
    if not content:
        return jsonify({'error': '评论内容不能为空'}), 400
    
    user = User.query.get(user_id)
    comment = Comment(content=content, user_id=user_id, post_id=post_id)
    
    # 添加评论积分奖励
    user.points += POINTS_CONFIG['comment']
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'nickname': user.nickname,
        'content': content,
        'timestamp': comment.timestamp.strftime('%Y-%m-%d %H:%M'),
        'points_earned': POINTS_CONFIG['comment'],
        'total_points': user.points
    })

@main.route('/api/favorite/<int:post_id>', methods=['POST'])
def favorite_post(post_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    user = User.query.get(user_id)
    post = Post.query.get(post_id)
    points_earned = 0
    
    if post in user.favorite_posts:
        user.favorite_posts.remove(post)
        favorited = False
    else:
        user.favorite_posts.append(post)
        favorited = True
        # 检查是否是今天第一次收藏
        today = date.today()
        if user.last_favorite_date != today:
            user.points += POINTS_CONFIG['favorite']
            points_earned = POINTS_CONFIG['favorite']
            user.last_favorite_date = today
    
    db.session.commit()
    return jsonify({
        'favorited': favorited,
        'points_earned': points_earned,
        'total_points': user.points
    })

@main.route('/api/comments/<int:post_id>', methods=['GET'])
def load_comments(post_id):
    page = request.args.get('page', 1, type=int)
    per_page = 5  # 每页5条评论
    initial_comments = 3  # 首页显示的评论数
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': '帖子不存在'}), 404
    
    # 获取所有评论总数
    total_comments = post.comments.count()
    
    # 计算已加载的评论数（初始3条 + 之前页面的评论）
    loaded_comments = initial_comments + ((page - 2) * per_page)
    
    # 获取当前页的评论
    current_page_comments = post.comments.order_by(Comment.timestamp.desc())\
        .offset(loaded_comments)\
        .limit(per_page)\
        .all()
    
    comments_data = [{
        'id': comment.id,
        'nickname': comment.author.nickname,
        'content': comment.content,
        'timestamp': comment.timestamp.strftime('%Y-%m-%d %H:%M'),
        'author_avatar': comment.author.nickname[0],
        'is_author': comment.user_id == user_id  # 添加作者标识
    } for comment in current_page_comments]
    
    # 计算剩余未加载的评论数
    remaining_count = total_comments - (loaded_comments + len(current_page_comments))
    
    return jsonify({
        'comments': comments_data,
        'has_next': remaining_count > 0,
        'total': total_comments,
        'current_page': page,
        'per_page': per_page,
        'current_count': len(current_page_comments),
        'remaining_count': remaining_count,
        'loaded_comments': loaded_comments + len(current_page_comments)
    }) 

@main.route('/api/post/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': '帖子不存在'}), 404
    
    if post.user_id != user_id:
        return jsonify({'error': '无权删除此帖子'}), 403
    
    try:
        # 先清理所有点赞和收藏关系
        db.session.execute(post_likes.delete().where(post_likes.c.post_id == post_id))
        db.session.execute(post_favorites.delete().where(post_favorites.c.post_id == post_id))
        
        # 删除帖子（评论会自动级联删除）
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': '删除成功'})
    except Exception as e:
        print(f"删除失败: {str(e)}")  # 添加错误日志
        db.session.rollback()
        return jsonify({'error': '删除失败，请稍后重试'}), 500

@main.route('/api/comment/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': '评论不存在'}), 404
    
    if comment.user_id != user_id:
        return jsonify({'error': '无权删除此评论'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'message': '删除成功'}) 

@main.route('/api/posts')
def load_posts():
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 每页显示10条帖子
    
    # 获取分页的帖子
    pagination = Post.query.order_by(Post.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    for post in pagination.items:
        # 获取每个帖子的最新3条评论
        recent_comments = post.comments.order_by(Comment.timestamp.desc()).limit(3).all()
        comments_data = [{
            'id': comment.id,
            'nickname': comment.author.nickname,
            'content': comment.content,
            'timestamp': comment.timestamp.strftime('%Y-%m-%d %H:%M'),
            'author_avatar': comment.author.nickname[0],
            'is_author': comment.user_id == user_id
        } for comment in recent_comments]
        
        posts_data.append({
            'id': post.id,
            'content': post.content,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M'),
            'author': {
                'nickname': post.author.nickname,
                'avatar': post.author.nickname[0]
            },
            'likes_count': post.likes_count,
            'comments_count': post.comments.count(),
            'is_liked': post in user.liked_posts if user else False,
            'is_favorited': post in user.favorite_posts if user else False,
            'is_author': post.user_id == user_id,
            'comments': comments_data,
            'remaining_comments': post.comments.count() - len(comments_data)
        })
    
    return jsonify({
        'posts': posts_data,
        'has_next': pagination.has_next,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }) 

@main.route('/profile')
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('main.index'))
    
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        return redirect(url_for('main.index'))
    
    return render_template('profile.html', user=user)

@main.route('/api/profile/update', methods=['POST'])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    nickname = request.json.get('nickname')
    if not nickname or len(nickname) > 64:
        return jsonify({'error': '昵称不能为空且不能超过64个字符'}), 400
    
    # 更新昵称
    user.nickname = nickname
    db.session.commit()
    
    return jsonify({
        'message': '更新成功',
        'nickname': user.nickname
    })

@main.route('/api/profile/phone', methods=['POST'])
def update_phone():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '请先登录'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    phone = request.json.get('phone')
    code = request.json.get('code')
    
    if not phone or len(phone) != 11:
        return jsonify({'error': '请输入有效的手机号'}), 400
    
    # 验证验证码
    stored_code = verification_codes.get(phone)
    if not stored_code or stored_code != code:
        return jsonify({'error': '验证码错误'}), 400
    
    # 检查手机号是否已被使用
    if User.query.filter(User.phone == phone, User.id != user_id).first():
        return jsonify({'error': '该手机号已被使用'}), 400
    
    # 更新手机号
    user.phone = phone
    db.session.commit()
    
    # 清除验证码
    verification_codes.pop(phone, None)
    
    return jsonify({
        'message': '手机号更新成功',
        'phone': user.phone
    })

@main.route('/logout')
def logout():
    session.pop('user_id', None)
    return """
        <script>
            setTimeout(function() {
                window.location.href = '/';
            }, 1000);
        </script>
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f9fafb;">
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem; color: #374151; font-size: 1.25rem;">退出成功</div>
                <div style="color: #6b7280;">正在返回登录页面...</div>
            </div>
        </div>
    """ 