import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import CommentList from './CommentList';

interface PostDetailsProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    comments: {
      id: string;
      content: string;
      createdAt: string;
    }[];
  };
}

const PostDetails: React.FC<PostDetailsProps> = ({ post }) => {
  return (
    <Card className="my-3">
      <Card.Header>
        <h1>{post.title}</h1>
      </Card.Header>
      <Card.Body>
        <p>{post.content}</p>
        <div className="text-end">
          <Badge bg="secondary">
            Created At: {new Date(parseInt(post.createdAt)).toLocaleString()}
          </Badge>
        </div>
        <CommentList comments={post.comments as { id: string; content: string; createdAt: string; postId: number }[]} postId={Number(post.id)} />
      </Card.Body>
    </Card>
  );
};

export default PostDetails;
