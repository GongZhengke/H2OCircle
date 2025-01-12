"""add post_id to comments

Revision ID: xxxx
Revises: xxxx
Create Date: 2024-xx-xx

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 先删除现有的评论数据
    op.execute('DELETE FROM comment')
    
    # 添加 post_id 列
    op.add_column('comment', sa.Column('post_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'comment', 'post', ['post_id'], ['id'])

def downgrade():
    op.drop_constraint(None, 'comment', type_='foreignkey')
    op.drop_column('comment', 'post_id') 