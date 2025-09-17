import { Draggable } from '@hello-pangea/dnd';
import { TypeIcon, PriorityFlag, Icon } from './Icons.jsx';
import Avatar from './Avatar.jsx';

export default function IssueCard({ issue, index, onClick, interactive = true }) {
  const card = (
    <div className={`issue-card ${interactive ? 'issue-card-clickable' : ''}`}>
      <div className="issue-card-top">
        <TypeIcon type={issue.type} />
        <span className="issue-card-key">{issue.key}</span>
        <span className="issue-card-icons">
          {issue.storyPoints != null && (
            <span className="story-points" title="Story points">
              {issue.storyPoints}
            </span>
          )}
          {issue.comments && issue.comments.length > 0 && (
            <span className="issue-card-comments" title={`${issue.comments.length} comments`}>
              <Icon name="comment" size={13} />
              {issue.comments.length}
            </span>
          )}
        </span>
      </div>
      <div className="issue-card-title">{issue.title}</div>
      {issue.labels && issue.labels.length > 0 && (
        <div className="issue-card-labels">
          {issue.labels.slice(0, 3).map((l) => (
            <span className="issue-label" key={l}>
              {l}
            </span>
          ))}
