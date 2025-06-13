import { SEARCH_USERS } from "@/graph/user";
import { useLazyQuery } from "@apollo/client";
import { useState, useEffect, useMemo } from "react";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  useController,
} from "react-hook-form";

interface User {
  id: string;
  nickName: string;
}

interface UserSearchInputProps<T extends FieldValues> {
  name: string;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  currentUserId?: string; // 現在のユーザーIDを除外するため
}

export function UserSearchInput<T extends FieldValues>({
  name,
  control,
  label = "一緒に制作した人",
  placeholder = "ユーザー名で検索...",
  currentUserId,
}: UserSearchInputProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name: name as Path<T>,
    control,
    defaultValue: [] as PathValue<T, Path<T>>,
  });

  const selectedUsers: User[] = useMemo(() => value || [], [value]);

  const [searchUsers, { data: searchData, loading: isSearching }] =
    useLazyQuery(SEARCH_USERS);

  const searchResults = useMemo(() => {
    if (!searchData?.profileByNickName) return [];

    let users: User[] = [];

    if (Array.isArray(searchData.profileByNickName)) {
      users = searchData.profileByNickName;
    } else if (
      searchData.profileByNickName &&
      typeof searchData.profileByNickName === "object"
    ) {
      users = [searchData.profileByNickName];
    } else {
      return [];
    }

    return users.filter(
      (user: User) =>
        user &&
        user.id &&
        user.id !== currentUserId &&
        !selectedUsers.some((selected) => selected.id === user.id),
    );
  }, [searchData, currentUserId, selectedUsers]);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowDropdown(true);
      searchUsers({
        variables: { nickName: searchTerm },
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  // 検索結果が取得できたらドロップダウンを表示
  useEffect(() => {
    if (searchResults.length > 0 && searchTerm.length >= 2) {
      setShowDropdown(true);
    }
  }, [searchResults, searchTerm]);

  const handleAddUser = (user: User) => {
    const newSelectedUsers = [...selectedUsers, user];
    onChange(newSelectedUsers);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((user) => user.id !== userId);
    onChange(newSelectedUsers);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  type InputBlurEvent = React.FocusEvent<HTMLInputElement>;

  const handleInputBlur = (e: InputBlurEvent) => {
    if (
      !e.relatedTarget ||
      !(
        e.currentTarget.parentNode instanceof Node &&
        e.currentTarget.parentNode.contains(e.relatedTarget as Node)
      )
    ) {
      setTimeout(() => setShowDropdown(false), 200);
    }
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {selectedUsers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm"
            >
              <span>{user.nickName}</span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />

        {isSearching && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* 表示条件を明確化 */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-[9999] mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
            <div className="max-h-60 overflow-auto">
              {searchResults.map((user: User) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAddUser(user)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div>
                    <div className="font-medium">{user.nickName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showDropdown &&
          searchTerm.length >= 2 &&
          !isSearching &&
          searchResults.length === 0 && (
            <div className="absolute z-[9999] mt-1 w-full rounded-md border border-gray-300 bg-white p-4 text-center text-gray-500 shadow-lg">
              該当するユーザーが見つかりませんでした
            </div>
          )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
